<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\TaskModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Tasks Controller
 * Handles CRUD operations for tasks
 */
class Tasks extends BaseController
{
    private TaskModel $taskModel;

    public function __construct()
    {
        $this->taskModel = new TaskModel();
    }

    /**
     * Get all tasks
     * GET /tasks
     * 
     * @return ResponseInterface
     */
    public function index(): ResponseInterface
    {
        try {
            $tasks = $this->taskModel->findAll();
            return $this->response->setJSON($tasks);
        } catch (\Exception $e) {
            log_message('error', 'Error fetching tasks: ' . $e->getMessage());
            return $this->response
                ->setStatusCode(500)
                ->setJSON(['error' => 'Internal server error']);
        }
    }

    /**
     * Get specific task by ID
     * GET /tasks/{id}
     * 
     * @param int|null $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface
    {
        if (!$id || !is_numeric($id)) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON(['error' => 'Invalid task ID']);
        }

        try {
            $task = $this->taskModel->find($id);
            
            if (!$task) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON(['error' => 'Task not found']);
            }

            return $this->response->setJSON($task);
        } catch (\Exception $e) {
            log_message('error', 'Error fetching task: ' . $e->getMessage());
            return $this->response
                ->setStatusCode(500)
                ->setJSON(['error' => 'Internal server error']);
        }
    }

    /**
     * Create new task
     * POST /tasks
     * 
     * @return ResponseInterface
     */
    public function create(): ResponseInterface
    {
        $data = $this->request->getJSON(true);
        
        // Validate input
        $validation = $this->validateTaskData($data, true);
        if ($validation !== true) {
            return $validation;
        }

        try {
            $taskData = [
                'title' => trim($data['title']),
                'completed' => 0 // Always create tasks as not completed
            ];

            // Override if completed is explicitly provided
            if (isset($data['completed'])) {
                $completed = $data['completed'];
                if (is_string($completed)) {
                    $taskData['completed'] = in_array(strtolower($completed), ['true', '1', 'yes']) ? 1 : 0;
                } else {
                    $taskData['completed'] = $completed ? 1 : 0;
                }
            }

            $id = $this->taskModel->insert($taskData);
            
            if (!$id) {
                return $this->response
                    ->setStatusCode(500)
                    ->setJSON(['error' => 'Failed to create task']);
            }

            $task = $this->taskModel->find($id);
            return $this->response
                ->setStatusCode(201)
                ->setJSON($task);
                
        } catch (\Exception $e) {
            log_message('error', 'Error creating task: ' . $e->getMessage());
            return $this->response
                ->setStatusCode(500)
                ->setJSON(['error' => 'Internal server error']);
        }
    }

    /**
     * Update existing task
     * PUT /tasks/{id}
     * 
     * @param int|null $id
     * @return ResponseInterface
     */
    public function update($id = null): ResponseInterface
    {
        if (!$id || !is_numeric($id)) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON(['error' => 'Invalid task ID']);
        }

        $data = $this->request->getJSON(true);
        
        // Log debugging information
        log_message('debug', 'Update task data received: ' . json_encode($data));
        
        // Validate input
        $validation = $this->validateTaskData($data, false);
        if ($validation !== true) {
            return $validation;
        }

        try {
            // Check if task exists
            $existingTask = $this->taskModel->find($id);
            if (!$existingTask) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON(['error' => 'Task not found']);
            }

            // Prepare update data
            $updateData = [];
            if (isset($data['title'])) {
                $updateData['title'] = trim($data['title']);
            }
            if (isset($data['completed'])) {
                // Convert various possible values to boolean
                $completed = $data['completed'];
                if (is_string($completed)) {
                    $updateData['completed'] = in_array(strtolower($completed), ['true', '1', 'yes']) ? 1 : 0;
                } else {
                    $updateData['completed'] = $completed ? 1 : 0;
                }
            }

            if (empty($updateData)) {
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON(['error' => 'No valid data provided for update']);
            }

            // Log what we're trying to update
            log_message('debug', 'Attempting to update task ' . $id . ' with data: ' . json_encode($updateData));

            $success = $this->taskModel->update($id, $updateData);
            
            if (!$success) {
                return $this->response
                    ->setStatusCode(500)
                    ->setJSON(['error' => 'Failed to update task']);
            }

            $task = $this->taskModel->find($id);
            return $this->response->setJSON($task);
            
        } catch (\Exception $e) {
            log_message('error', 'Error updating task: ' . $e->getMessage());
            return $this->response
                ->setStatusCode(500)
                ->setJSON(['error' => 'Internal server error']);
        }
    }

    /**
     * Delete task
     * DELETE /tasks/{id}
     * 
     * @param int|null $id
     * @return ResponseInterface
     */
    public function delete($id = null): ResponseInterface
    {
        if (!$id || !is_numeric($id)) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON(['error' => 'Invalid task ID']);
        }

        try {
            // Check if task exists
            $existingTask = $this->taskModel->find($id);
            if (!$existingTask) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON(['error' => 'Task not found']);
            }

            $success = $this->taskModel->delete($id);
            
            if (!$success) {
                return $this->response
                    ->setStatusCode(500)
                    ->setJSON(['error' => 'Failed to delete task']);
            }

            return $this->response->setJSON([
                'id' => $id,
                'deleted' => true,
                'message' => 'Task deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            log_message('error', 'Error deleting task: ' . $e->getMessage());
            return $this->response
                ->setStatusCode(500)
                ->setJSON(['error' => 'Internal server error']);
        }
    }

    /**
     * Validate task data
     * 
     * @param array|null $data
     * @param bool $isCreate
     * @return ResponseInterface|bool
     */
    private function validateTaskData($data, bool $isCreate)
    {
        if (!$data) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON(['error' => 'No data provided']);
        }

        // For create operations, title is required
        if ($isCreate) {
            if (!isset($data['title']) || empty(trim($data['title']))) {
                return $this->response
                    ->setStatusCode(422)
                    ->setJSON(['error' => 'Title is required']);
            }
        }

        // Validate title if provided
        if (isset($data['title'])) {
            $title = trim($data['title']);
            if (empty($title)) {
                return $this->response
                    ->setStatusCode(422)
                    ->setJSON(['error' => 'Title cannot be empty']);
            }
            
            if (strlen($title) > 255) {
                return $this->response
                    ->setStatusCode(422)
                    ->setJSON(['error' => 'Title cannot exceed 255 characters']);
            }
        }

        return true;
    }
}
