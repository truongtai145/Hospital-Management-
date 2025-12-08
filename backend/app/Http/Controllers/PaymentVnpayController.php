<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PaymentVnpayController extends Controller
{
    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPayment(Request $request)
    {
        try {
            $request->validate([
                'payment_id' => 'required|integer'
            ]);

            $paymentId = $request->payment_id;
            $payment = Payment::with(['patient', 'appointment'])->find($paymentId);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hóa đơn.'
                ], 404);
            }

            // Kiểm tra trạng thái
            if ($payment->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hóa đơn này đã được thanh toán.'
                ], 409);
            }

            // Cấu hình VNPay
            $vnp_TmnCode = env('VNP_TMN_CODE');
            $vnp_HashSecret = env('VNP_HASH_SECRET');
            $vnp_Url = env('VNP_URL');
            $vnp_ReturnUrl = env('VNP_RETURN_URL');

            if (!$vnp_TmnCode || !$vnp_HashSecret || !$vnp_Url || !$vnp_ReturnUrl) {
                Log::error('VNPay configuration missing');
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi cấu hình phía máy chủ.'
                ], 500);
            }

            // Tạo mã giao dịch
            $vnp_TxnRef = 'PAY' . $payment->id . '_' . date('His');
            $vnp_OrderInfo = 'Thanh toan hoa don benh vien #' . $payment->transaction_id;
            $vnp_Amount = $payment->total_amount * 100; // VNPay yêu cầu số tiền x100
            $vnp_Locale = 'vn';
            $vnp_IpAddr = $request->ip();
            $vnp_CreateDate = date('YmdHis');
            $vnp_ExpireDate = date('YmdHis', strtotime('+15 minutes'));

            // Cập nhật payment - chuyển sang trạng thái processing
            $payment->update([
                'payment_method' => 'vnpay',
                'status' => 'processing'
            ]);

            // Tạo mảng dữ liệu
            $inputData = array(
                "vnp_Version" => "2.1.0",
                "vnp_TmnCode" => $vnp_TmnCode,
                "vnp_Amount" => $vnp_Amount,
                "vnp_Command" => "pay",
                "vnp_CreateDate" => $vnp_CreateDate,
                "vnp_CurrCode" => "VND",
                "vnp_IpAddr" => $vnp_IpAddr,
                "vnp_Locale" => $vnp_Locale,
                "vnp_OrderInfo" => $vnp_OrderInfo,
                "vnp_OrderType" => "other",
                "vnp_ReturnUrl" => $vnp_ReturnUrl,
                "vnp_TxnRef" => $vnp_TxnRef,
                "vnp_ExpireDate" => $vnp_ExpireDate
            );

            ksort($inputData);
            $query = "";
            $i = 0;
            $hashdata = "";
            
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashdata .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
                $query .= urlencode($key) . "=" . urlencode($value) . '&';
            }

            $vnp_Url = $vnp_Url . "?" . $query;
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;

            Log::info('VNPay payment URL created for payment #' . $payment->id);

            return response()->json([
                'success' => true,
                'paymentUrl' => $vnp_Url,
                'vnp_TxnRef' => $vnp_TxnRef
            ]);

        } catch (\Exception $e) {
            Log::error('VNPay create payment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tạo URL thanh toán.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xử lý return từ VNPay (redirect về frontend)
     */
    public function vnpayReturn(Request $request)
    {
        try {
            Log::info('VNPay Return received', $request->all());

            $vnp_SecureHash = $request->vnp_SecureHash;
            $inputData = $request->except('vnp_SecureHash');
            
            ksort($inputData);
            $hashData = "";
            $i = 0;
            
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashData .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
            }

            $secureHash = hash_hmac('sha512', $hashData, env('VNP_HASH_SECRET'));

            // Verify checksum
            if ($secureHash !== $vnp_SecureHash) {
                Log::error('VNPay Return - Invalid checksum');
                return redirect(env('FRONTEND_URL') . '/payment-result?status=failed&error=invalid_checksum');
            }

            $vnp_TxnRef = $request->vnp_TxnRef;
            $vnp_ResponseCode = $request->vnp_ResponseCode;
            $vnp_TransactionStatus = $request->vnp_TransactionStatus;
            $vnp_Amount = $request->vnp_Amount / 100; // Chia 100 để về số tiền thực

            // Parse payment ID từ vnp_TxnRef (format: PAY{id}_{timestamp})
            preg_match('/PAY(\d+)_/', $vnp_TxnRef, $matches);
            $paymentId = $matches[1] ?? null;

            if (!$paymentId) {
                Log::error('VNPay Return - Cannot parse payment ID from: ' . $vnp_TxnRef);
                return redirect(env('FRONTEND_URL') . '/payment-result?status=failed&error=invalid_txn_ref');
            }

            $payment = Payment::find($paymentId);

            if (!$payment) {
                Log::error('VNPay Return - Payment not found: ' . $paymentId);
                return redirect(env('FRONTEND_URL') . '/payment-result?status=failed&error=payment_not_found&paymentId=' . $paymentId);
            }

            Log::info('Found payment #' . $paymentId . ', current status: ' . $payment->status);

            // Xử lý kết quả
            if ($vnp_ResponseCode == '00' && $vnp_TransactionStatus == '00') {
                // Thanh toán thành công
                $payment->update([
                    'status' => 'completed',
                    'payment_date' => now(),
                    'payment_method' => 'vnpay'
                ]);

                Log::info('VNPay Return - Payment #' . $paymentId . ' completed successfully');

                return redirect(env('FRONTEND_URL') . '/payment-result?status=success&paymentId=' . $paymentId . '&amount=' . $vnp_Amount . '&txnRef=' . $vnp_TxnRef);
            } else {
                // Thanh toán thất bại
                $payment->update([
                    'status' => 'failed',
                    'payment_method' => 'vnpay'
                ]);

                Log::warning('VNPay Return - Payment #' . $paymentId . ' failed with code: ' . $vnp_ResponseCode);

                return redirect(env('FRONTEND_URL') . '/payment-result?status=failed&paymentId=' . $paymentId . '&responseCode=' . $vnp_ResponseCode);
            }

        } catch (\Exception $e) {
            Log::error('VNPay Return error: ' . $e->getMessage());
            return redirect(env('FRONTEND_URL') . '/payment-result?status=error&error=server_error');
        }
    }

    /**
     * Xử lý IPN từ VNPay (webhook)
     */
    public function vnpayIpn(Request $request)
    {
        try {
            Log::info('VNPay IPN received', $request->all());

            $vnp_SecureHash = $request->vnp_SecureHash;
            $inputData = $request->except('vnp_SecureHash');
            
            ksort($inputData);
            $hashData = "";
            $i = 0;
            
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashData .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
            }

            $secureHash = hash_hmac('sha512', $hashData, env('VNP_HASH_SECRET'));

            // Verify checksum
            if ($secureHash !== $vnp_SecureHash) {
                Log::error('VNPay IPN - Invalid checksum');
                return response()->json(['RspCode' => '97', 'Message' => 'Invalid Checksum']);
            }

            $vnp_TxnRef = $request->vnp_TxnRef;
            $vnp_ResponseCode = $request->vnp_ResponseCode;
            $vnp_TransactionStatus = $request->vnp_TransactionStatus;

            // Parse payment ID
            preg_match('/PAY(\d+)_/', $vnp_TxnRef, $matches);
            $paymentId = $matches[1] ?? null;

            if (!$paymentId) {
                Log::error('VNPay IPN - Cannot parse payment ID');
                return response()->json(['RspCode' => '02', 'Message' => 'Invalid TxnRef']);
            }

            $payment = Payment::find($paymentId);

            if (!$payment) {
                Log::error('VNPay IPN - Payment not found: ' . $paymentId);
                return response()->json(['RspCode' => '01', 'Message' => 'Payment not found']);
            }

            Log::info('VNPay IPN - Found payment #' . $paymentId . ', current status: ' . $payment->status);

            // Nếu đã thanh toán rồi
            if ($payment->status === 'completed') {
                Log::info('VNPay IPN - Payment #' . $paymentId . ' already completed');
                return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);
            }

            // Cập nhật trạng thái
            if ($vnp_ResponseCode == '00' && $vnp_TransactionStatus == '00') {
                $payment->update([
                    'status' => 'completed',
                    'payment_date' => now(),
                    'payment_method' => 'vnpay'
                ]);
                Log::info('VNPay IPN - Payment #' . $paymentId . ' updated to completed');
            } else {
                $payment->update([
                    'status' => 'failed',
                    'payment_method' => 'vnpay'
                ]);
                Log::warning('VNPay IPN - Payment #' . $paymentId . ' failed');
            }

            return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);

        } catch (\Exception $e) {
            Log::error('VNPay IPN error: ' . $e->getMessage());
            return response()->json(['RspCode' => '99', 'Message' => 'Unknown error']);
        }
    }
}