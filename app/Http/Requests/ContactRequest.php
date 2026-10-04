<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContactRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'service' => ['required', 'string', 'max:150'],
            'place' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please fill in all required fields.',
            'name.max' => 'Name is too long.',
            'email.required' => 'Please fill in all required fields.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email address is too long.',
            'phone.required' => 'Please fill in all required fields.',
            'phone.max' => 'Phone number is too long.',
            'service.required' => 'Please fill in all required fields.',
            'service.max' => 'Service name is too long.',
            'place.required' => 'Please fill in all required fields.',
            'place.max' => 'Place name is too long.',
            'district.required' => 'Please fill in all required fields.',
            'district.max' => 'District name is too long.',
            'message.required' => 'Please fill in all required fields.',
            'message.max' => 'Message is too long.',
        ];
    }

    /**
     * Handle a failed validation attempt with matching JSON response.
     */
    protected function failedValidation(Validator $validator)
    {
        $firstError = $validator->errors()->first();

        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $firstError,
            'errors' => $validator->errors()
        ], 400));
    }
}
