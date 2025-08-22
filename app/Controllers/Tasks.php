<?php
namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\TaskModel;

class Tasks extends BaseController
{


    public function index()
    {
        $model = new TaskModel();
    return $this->response->setJSON($model->findAll());
    }

    public function show($id = null)
    {
        $model = new TaskModel();
        $task = $model->find($id);
        if ($task) {
            return $this->response->setJSON($task);
        }
        return $this->response->setStatusCode(404)->setJSON(['error' => 'Task not found']);
    }

    public function create()
    {
        $model = new TaskModel();
        $data = $this->request->getJSON(true);
        if (!$data || !isset($data['title'])) {
            return $this->response->setStatusCode(422)->setJSON(['error' => 'Title is required']);
        }
        $id = $model->insert([
            'title' => $data['title'],
            'completed' => $data['completed'] ?? false
        ]);
        return $this->response->setStatusCode(201)->setJSON($model->find($id));
    }

    public function update($id = null)
    {
        $model = new TaskModel();
        $data = $this->request->getJSON(true);
        if (!$data) {
            return $this->response->setStatusCode(422)->setJSON(['error' => 'No data provided']);
        }
        if ($model->update($id, $data)) {
            return $this->response->setJSON($model->find($id));
        }
        return $this->response->setStatusCode(400)->setJSON(['error' => 'Update failed']);
    }

    public function delete($id = null)
    {
        $model = new TaskModel();
        if ($model->delete($id)) {
            return $this->response->setJSON(['id' => $id, 'deleted' => true]);
        }
        return $this->response->setStatusCode(404)->setJSON(['error' => 'Task not found']);
    }
}
