<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class FaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $action = $this->input('action', 'create');

        if (in_array($action, ['create', 'update'])) {
            return [
                'action' => ['nullable', 'string'],
                'id' => [$action === 'update' ? 'required' : 'nullable', 'integer'],
                'question' => ['required', 'string'],
                'answer' => ['required', 'string'],
                'category' => ['nullable', 'string', 'max:100'],
                'display_order' => ['nullable', 'integer'],
                'is_active' => ['nullable'],
            ];
        }

        return [
            'action' => ['required', 'string'],
            'id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'question.required' => 'Question and answer are required.',
            'answer.required' => 'Question and answer are required.',
            'id.required' => 'Valid FAQ ID is required.',
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
