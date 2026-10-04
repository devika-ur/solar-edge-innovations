<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['nullable', 'string'],
            'project_id' => ['nullable', 'integer'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:published,draft'],
            'cover_image' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'gallery_images' => ['nullable'],
            'gallery_images.*' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'cover_image.max' => 'Cover image exceeds the limit of 5 MB.',
            'cover_image.mimes' => 'Invalid file format. Only JPG, PNG, and WebP images are permitted.',
            'gallery_images.*.max' => 'Gallery image exceeds the limit of 5 MB.',
            'gallery_images.*.mimes' => 'Invalid file format. Only JPG, PNG, and WebP images are permitted.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors()
        ], 400));
    }
}
