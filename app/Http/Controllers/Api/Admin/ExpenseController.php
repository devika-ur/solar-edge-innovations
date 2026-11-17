<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Other Expenses - Super Admin only (enforced by the 'super_admin' route middleware).
 */
class ExpenseController extends Controller
{
    public const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'];

    /**
     * List expenses with optional filters and summary totals.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::query();

        $search = trim((string)$request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('paid_to', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        foreach (['start_date' => '>=', 'end_date' => '<='] as $param => $op) {
            $value = $request->query($param);
            if (!empty($value)) {
                try {
                    $query->whereDate('expense_date', $op, Carbon::parse($value)->toDateString());
                } catch (\Throwable $e) {
                    // ignore invalid date
                }
            }
        }

        $expenses = $query->orderBy('expense_date', 'desc')->orderBy('id', 'desc')->get();

        $data = $expenses->map(fn (Expense $e) => $this->format($e));

        $monthStart = Carbon::now()->startOfMonth()->toDateString();

        return response()->json([
            'success' => true,
            'data' => $data,
            'summary' => [
                'filtered_total' => round((float)$expenses->sum('amount'), 2),
                'filtered_count' => $expenses->count(),
                'this_month_total' => round((float)Expense::whereDate('expense_date', '>=', $monthStart)->sum('amount'), 2),
                'all_time_total' => round((float)Expense::sum('amount'), 2),
                'all_time_count' => Expense::count(),
            ],
            'payment_methods' => self::PAYMENT_METHODS,
        ]);
    }

    /**
     * Create a new expense.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateExpense($request);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }

        $validated['created_by'] = $request->hasSession() ? $request->session()->get('admin_username', 'admin') : 'admin';
        $expense = Expense::create($validated);

        ActivityLogger::added(
            'Expense',
            "Expense: {$expense->title}",
            $expense->id,
            "Added expense '{$expense->title}' of ₹" . number_format($expense->amount, 2) . ".",
            $this->format($expense)
        );

        return response()->json([
            'success' => true,
            'message' => 'Expense saved successfully.',
            'data' => $this->format($expense),
        ]);
    }

    /**
     * Update an existing expense.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['success' => false, 'message' => 'Expense not found.'], 404);
        }

        $validated = $this->validateExpense($request);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }

        $old = $this->format($expense);
        $expense->update($validated);

        ActivityLogger::edited(
            'Expense',
            "Expense: {$expense->title}",
            $expense->id,
            "Updated expense '{$expense->title}' (₹" . number_format($expense->amount, 2) . ").",
            $old,
            $this->format($expense)
        );

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully.',
            'data' => $this->format($expense),
        ]);
    }

    /**
     * Permanently delete an expense from the database (password confirmed).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['success' => false, 'message' => 'Expense not found.'], 404);
        }

        if (!ActivityLogController::verifyAdminPassword((string)$request->input('password', ''))) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password. Expense was not deleted.',
            ], 403);
        }

        $snapshot = $this->format($expense);
        $expense->delete(); // hard delete - row is removed from the database

        ActivityLogger::deleted(
            'Expense',
            "Expense: {$snapshot['title']}",
            $snapshot['id'],
            "Permanently deleted expense '{$snapshot['title']}' of ₹" . number_format($snapshot['amount'], 2) . '.',
            $snapshot
        );

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted permanently.',
        ]);
    }

    /**
     * @return array|JsonResponse
     */
    protected function validateExpense(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'paid_to' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ], [
            'title.required' => 'Please enter what the expense was for.',
            'amount.required' => 'Please enter the amount.',
            'amount.gt' => 'Amount must be greater than 0.',
            'expense_date.required' => 'Please select the expense date.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        return [
            'title' => trim($data['title']),
            'amount' => round((float)$data['amount'], 2),
            'expense_date' => Carbon::parse($data['expense_date'])->toDateString(),
            'payment_method' => trim((string)($data['payment_method'] ?? '')) ?: 'Cash',
            'paid_to' => trim((string)($data['paid_to'] ?? '')) ?: null,
            'notes' => trim((string)($data['notes'] ?? '')) ?: null,
        ];
    }

    protected function format(Expense $e): array
    {
        return [
            'id' => (int)$e->id,
            'title' => $e->title,
            'amount' => (float)$e->amount,
            'expense_date' => $e->expense_date?->toDateString(),
            'expense_date_formatted' => $e->expense_date?->format('d M Y'),
            'payment_method' => $e->payment_method,
            'paid_to' => $e->paid_to,
            'notes' => $e->notes,
            'created_by' => $e->created_by,
            'created_at_formatted' => $e->created_at?->format('d M Y, h:i A'),
        ];
    }
}
