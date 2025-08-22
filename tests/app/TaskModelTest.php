<?php

namespace Tests\App;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;
use App\Models\TaskModel;

/**
 * Task Model Test
 * Tests for TaskModel functionality
 */
class TaskModelTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate = true;
    protected $migrateOnce = false;
    protected $refresh = true;
    protected $namespace = null;

    private TaskModel $model;

    protected function setUp(): void
    {
        parent::setUp();
        $this->model = new TaskModel();
    }

    public function testInsertTask(): void
    {
        $taskData = [
            'title' => 'Test Task',
            'completed' => false
        ];

        $id = $this->model->insert($taskData);
        
        $this->assertIsInt($id);
        $this->assertGreaterThan(0, $id);
        
        $task = $this->model->find($id);
        $this->assertEquals('Test Task', $task['title']);
        $this->assertEquals(0, $task['completed']);
    }

    public function testUpdateTask(): void
    {
        // Create task first
        $id = $this->model->insert([
            'title' => 'Update Me',
            'completed' => false
        ]);

        // Update the task
        $updateResult = $this->model->update($id, ['title' => 'Updated']);
        $this->assertTrue($updateResult);

        // Verify update
        $task = $this->model->find($id);
        $this->assertEquals('Updated', $task['title']);
    }

    public function testDeleteTask(): void
    {
        // Create task first
        $id = $this->model->insert([
            'title' => 'Delete Me',
            'completed' => false
        ]);

        // Verify task exists
        $task = $this->model->find($id);
        $this->assertNotNull($task);

        // Delete the task
        $deleteResult = $this->model->delete($id);
        $this->assertTrue($deleteResult);

        // Verify task is deleted
        $task = $this->model->find($id);
        $this->assertNull($task);
    }

    public function testToggleCompletion(): void
    {
        // Create incomplete task
        $id = $this->model->insert([
            'title' => 'Toggle Me',
            'completed' => false
        ]);

        // Toggle to completed
        $result = $this->model->toggleCompletion($id);
        $this->assertTrue($result);
        
        $task = $this->model->find($id);
        $this->assertEquals(1, $task['completed']);

        // Toggle back to incomplete
        $result = $this->model->toggleCompletion($id);
        $this->assertTrue($result);
        
        $task = $this->model->find($id);
        $this->assertEquals(0, $task['completed']);
    }

    public function testGetCompletedTasks(): void
    {
        // Create tasks with different completion status
        $this->model->insert(['title' => 'Completed Task 1', 'completed' => true]);
        $this->model->insert(['title' => 'Pending Task', 'completed' => false]);
        $this->model->insert(['title' => 'Completed Task 2', 'completed' => true]);

        $completedTasks = $this->model->getCompletedTasks();
        
        $this->assertCount(2, $completedTasks);
        foreach ($completedTasks as $task) {
            $this->assertEquals(1, $task['completed']);
        }
    }

    public function testGetPendingTasks(): void
    {
        // Create tasks with different completion status
        $this->model->insert(['title' => 'Completed Task', 'completed' => true]);
        $this->model->insert(['title' => 'Pending Task 1', 'completed' => false]);
        $this->model->insert(['title' => 'Pending Task 2', 'completed' => false]);

        $pendingTasks = $this->model->getPendingTasks();
        
        $this->assertCount(2, $pendingTasks);
        foreach ($pendingTasks as $task) {
            $this->assertEquals(0, $task['completed']);
        }
    }

    public function testMarkAsCompleted(): void
    {
        $id = $this->model->insert([
            'title' => 'Mark Me Complete',
            'completed' => false
        ]);

        $result = $this->model->markAsCompleted($id);
        $this->assertTrue($result);
        
        $task = $this->model->find($id);
        $this->assertEquals(1, $task['completed']);
    }

    public function testMarkAsPending(): void
    {
        $id = $this->model->insert([
            'title' => 'Mark Me Pending',
            'completed' => true
        ]);

        $result = $this->model->markAsPending($id);
        $this->assertTrue($result);
        
        $task = $this->model->find($id);
        $this->assertEquals(0, $task['completed']);
    }

    public function testValidationRules(): void
    {
        // Test empty title
        $result = $this->model->insert(['title' => '', 'completed' => false]);
        $this->assertFalse($result);
        
        // Test long title
        $longTitle = str_repeat('a', 256);
        $result = $this->model->insert(['title' => $longTitle, 'completed' => false]);
        $this->assertFalse($result);
    }
}
