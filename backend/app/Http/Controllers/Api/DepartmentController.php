<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;


class DepartmentController extends Controller
{
   
    public function index()
    {
        // Lấy tất cả các khoa đang hoạt động, sắp xếp theo tên
        $departments = Department::where('is_active', true)->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    // POST /api/v1/departments 
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'head_doctor_id' => 'nullable|exists:doctors,id',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $department = Department::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo khoa mới thành công!',
            'data' => $department
        ], 201);
    }

   // GET /api/v1/departments/{id}
     
    public function show(Department $department)
    {
        return response()->json([
            'success' => true,
            'data' => $department
        ]);
    }

    // PUT /api/v1/departments/{id}
     
    public function update(Request $request, Department $department)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string',
            'head_doctor_id' => 'nullable|exists:doctors,id',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $department->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin khoa thành công!',
            'data' => $department
        ]);
    }

    
     
    // DELETE /api/v1/departments/{id}
     
    public function destroy(Department $department)
    {
        
        // khi xóa khoa,  bác sĩ thuộc khoa này  có department_id = null.
        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa khoa thành công!'
        ], 200);
    }
}