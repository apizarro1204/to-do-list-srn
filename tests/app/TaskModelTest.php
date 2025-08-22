<?php
namespace Tests\App;

use CodeIgniter\Test\CIUnitTestCase;
use App\Models\TaskModel;

class TaskModelTest extends CIUnitTestCase
{
    public function testInsertTask()
    {
        $model = new TaskModel();
        $id = $model->insert(['title' => 'Test Task']);
        $this->assertIsInt($id);
        $task = $model->find($id);
        $this->assertEquals('Test Task', $task['title']);
    }

    public function testUpdateTask()
    {
        $model = new TaskModel();
        $id = $model->insert(['title' => 'Update Me']);
        $model->update($id, ['title' => 'Updated']);
        $task = $model->find($id);
        $this->assertEquals('Updated', $task['title']);
    }

    public function testDeleteTask()
    {
        $model = new TaskModel();
        $id = $model->insert(['title' => 'Delete Me']);
        $model->delete($id);
        $task = $model->find($id);
        $this->assertNull($task);
    }
}
