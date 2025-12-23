<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Cualquier usuario autenticado puede crear reservaciones
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'space_id' => ['required', 'integer', 'exists:spaces,id'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'space_id.required' => 'El espacio es obligatorio',
            'space_id.exists' => 'El espacio seleccionado no existe',
            'start_time.required' => 'La fecha/hora de inicio es obligatoria',
            'start_time.date' => 'La fecha/hora de inicio debe ser válida',
            'start_time.after' => 'La fecha/hora de inicio debe ser futura',
            'end_time.required' => 'La fecha/hora de fin es obligatoria',
            'end_time.date' => 'La fecha/hora de fin debe ser válida',
            'end_time.after' => 'La fecha/hora de fin debe ser posterior al inicio',
            'notes.max' => 'Las notas no pueden exceder 500 caracteres',
        ];
    }
}
