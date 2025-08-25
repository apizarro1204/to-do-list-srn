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
     * Override insert to automatically add created_at
     */
    public function insert($data = null, bool $returnID = true)
    {
        if (is_array($data)) {
            // Always set created_at if not provided or if it's null
            if (!isset($data['created_at']) || $data['created_at'] === null) {
                $data['created_at'] = date('Y-m-d H:i:s');
            }
        }
        
        return parent::insert($data, $returnID);
    }

    /**
     * Override update to prevent clearing created_at
     */
    public function update($id = null, $data = null): bool
    {
        // If created_at is being set to null, set it to current time instead
        if (is_array($data) && isset($data['created_at']) && $data['created_at'] === null) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }
        
        return parent::update($id, $data);
    }

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
