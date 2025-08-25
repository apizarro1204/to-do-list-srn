<?php

namespace Tests\App;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\FeatureTestTrait;
use CodeIgniter\Test\DatabaseTestTrait;

/**
 * Tasks Controller Test
 * Integration tests for Tasks API endpoints
 */
class TasksControllerTest extends CIUnitTestCase
{
    use FeatureTestTrait;
    use DatabaseTestTrait;

    protected $migrate = true;
    protected $migrateOnce = false;
    protected $refresh = true;
    protected $namespace = null;

    public function testGetAllTasks(): void
    {
        // Create test data
        $this->db->table('tasks')->insertBatch([
            ['title' => 'Task 1', 'completed' => false],
            ['title' => 'Task 2', 'completed' => true],
        ]);

        $result = $this->get('/tasks');
        
        $result->assertStatus(200);
        $result->assertJSONFragment(['title' => 'Task 1']);
        $result->assertJSONFragment(['title' => 'Task 2']);
    }

    public function testCreateTask(): void
    {
        $taskData = ['title' => 'New Test Task'];

        $result = $this->post('/tasks', $taskData);
        
        $result->assertStatus(201);
        $result->assertJSONFragment(['title' => 'New Test Task']);
        
        // Verify in database
        $this->seeInDatabase('tasks', ['title' => 'New Test Task']);
    }

    public function testCreateTaskWithoutTitle(): void
    {
        $result = $this->withHeaders(['Content-Type' => 'application/json'])
                       ->withBody(json_encode([]))
                       ->post('/tasks');
        
        $result->assertStatus(422);
        $result->assertJSONFragment(['error' => 'No data provided']);
    }

    public function testUpdateTask(): void
    {
        // Create task first
        $taskId = $this->db->table('tasks')->insert([
            'title' => 'Original Title',
            'completed' => false
        ]);

        $updateData = ['title' => 'Updated Title'];
        $result = $this->put("/tasks/{$taskId}", $updateData);
        
        $result->assertStatus(200);
        $result->assertJSONFragment(['title' => 'Updated Title']);
        
        // Verify in database
        $this->seeInDatabase('tasks', [
            'id' => $taskId,
            'title' => 'Updated Title'
        ]);
    }

    public function testUpdateNonExistentTask(): void
    {
        $updateData = ['title' => 'Updated Title'];
        $result = $this->withHeaders(['Content-Type' => 'application/json'])
                       ->withBody(json_encode($updateData))
                       ->put('/tasks/999');
        
        $result->assertStatus(404);
        $result->assertJSONFragment(['error' => 'Task not found']);
    }

    public function testDeleteTask(): void
    {
        // Create task first
        $taskId = $this->db->table('tasks')->insert([
            'title' => 'Delete Me',
            'completed' => false
        ]);

        $result = $this->delete("/tasks/{$taskId}");
        
        $result->assertStatus(200);
        $result->assertJSONFragment(['deleted' => true]);
        
        // Verify deleted from database
        $this->dontSeeInDatabase('tasks', ['id' => $taskId]);
    }

    public function testDeleteNonExistentTask(): void
    {
        $result = $this->delete('/tasks/999');
        
        $result->assertStatus(404);
        $result->assertJSONFragment(['error' => 'Task not found']);
    }

    public function testGetSpecificTask(): void
    {
        // Create task first
        $taskId = $this->db->table('tasks')->insert([
            'title' => 'Specific Task',
            'completed' => false
        ]);

        $result = $this->get("/tasks/{$taskId}");
        
        $result->assertStatus(200);
        $result->assertJSONFragment(['title' => 'Specific Task']);
    }

    public function testGetNonExistentTask(): void
    {
        $result = $this->get('/tasks/999');
        
        $result->assertStatus(404);
        $result->assertJSONFragment(['error' => 'Task not found']);
    }

    // Additional "sad path" tests for better coverage
    public function testCreateTaskWithEmptyTitle(): void
    {
        $taskData = ['title' => ''];

        $result = $this->withHeaders(['Content-Type' => 'application/json'])
                       ->withBody(json_encode($taskData))
                       ->post('/tasks');
        
        $result->assertStatus(422);
        $result->assertJSONFragment(['error' => 'Title is required']);
    }

    public function testCreateTaskWithTooLongTitle(): void
    {
        $taskData = ['title' => str_repeat('a', 256)]; // 256 characters, limit is 255

        $result = $this->withHeaders(['Content-Type' => 'application/json'])
                       ->withBody(json_encode($taskData))
                       ->post('/tasks');
        
        $result->assertStatus(422);
        $result->assertJSONFragment(['error' => 'Title cannot exceed 255 characters']);
    }

    public function testUpdateTaskWithEmptyTitle(): void
    {
        // Create task first
        $taskId = $this->db->table('tasks')->insert([
            'title' => 'Original Title',
            'completed' => false,
            'created_at' => date('Y-m-d H:i:s')
        ]);

        $updateData = ['title' => ''];
        $result = $this->withHeaders(['Content-Type' => 'application/json'])
                       ->withBody(json_encode($updateData))
                       ->put("/tasks/{$taskId}");
        
        $result->assertStatus(422);
        $result->assertJSONFragment(['error' => 'Title is required']);
    }
}
