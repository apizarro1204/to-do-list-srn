<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Task Model
 * Handles database operations for tasks
 */
class TaskModel extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'id';
    protected $allowedFields = ['title', 'completed', 'created_at'];
    protected $useTimestamps = false;
    protected $returnType = 'array';
    
    // Validation rules
    protected $validationRules = [
        'title' => 'required|max_length[255]',
        'completed' => 'permit_empty|in_list[0,1]'
    ];
    
    protected $validationMessages = [
        'title' => [
            'required' => 'Task title is required',
            'max_length' => 'Task title cannot exceed 255 characters'
        ],
        'completed' => [
            'in_list' => 'Completed field must be 0 or 1'
        ]
    ];

    /**
     * Get all tasks ordered by creation date
     * 
     * @return array
     */
    public function getAllTasks(): array
    {
        return $this->orderBy('created_at', 'DESC')->findAll();
    }

    /**
     * Get only completed tasks
     * 
     * @return array
     */
    public function getCompletedTasks(): array
    {
        return $this->where('completed', 1)
                    ->orderBy('created_at', 'DESC')
                    ->findAll();
    }

    /**
     * Get only pending tasks
     * 
     * @return array
     */
    public function getPendingTasks(): array
    {
        return $this->where('completed', 0)
                    ->orderBy('created_at', 'DESC')
                    ->findAll();
    }

    /**
     * Toggle task completion status
     * 
     * @param int $id
     * @return bool
     */
    public function toggleCompletion(int $id): bool
    {
        $task = $this->find($id);
        if (!$task) {
            return false;
        }

        $newStatus = $task['completed'] ? 0 : 1;
        return $this->update($id, ['completed' => $newStatus]);
    }

    /**
     * Mark task as completed
     * 
     * @param int $id
     * @return bool
     */
    public function markAsCompleted(int $id): bool
    {
        return $this->update($id, ['completed' => 1]);
    }

    /**
     * Mark task as pending
     * 
     * @param int $id
     * @return bool
     */
    public function markAsPending(int $id): bool
    {
        return $this->update($id, ['completed' => 0]);
    }
}
