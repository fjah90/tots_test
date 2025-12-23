<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // La verificación de propiedad se hace en el controlador
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
            'start_time' => ['sometimes', 'date', 'after:now'],
            'end_time' => ['sometimes', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'string', 'in:confirmed,cancelled,pending'],
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
            'start_time.date' => 'La fecha/hora de inicio debe ser válida',
            'start_time.after' => 'La fecha/hora de inicio debe ser futura',
            'end_time.date' => 'La fecha/hora de fin debe ser válida',
            'notes.max' => 'Las notas no pueden exceder 500 caracteres',
            'status.in' => 'El estado debe ser: confirmed, cancelled o pending',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $startTime = $this->input('start_time');
            $endTime = $this->input('end_time');

            // Si se proporcionan ambos, end_time debe ser posterior a start_time
            if ($startTime && $endTime && strtotime($endTime) <= strtotime($startTime)) {
                $validator->errors()->add(
                    'end_time',
                    'La fecha/hora de fin debe ser posterior al inicio'
                );
            }

            // Si solo se proporciona end_time, comparar con el start_time existente
            if (!$startTime && $endTime) {
                $reservation = $this->route('reservation');
                if ($reservation && strtotime($endTime) <= strtotime($reservation->start_time)) {
                    $validator->errors()->add(
                        'end_time',
                        'La fecha/hora de fin debe ser posterior al inicio actual de la reservación'
                    );
                }
            }
        });
    }
}
