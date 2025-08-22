<?php
namespace App\Models;

use CodeIgniter\Model;

class TaskModel extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'id';
    protected $allowedFields = ['title', 'completed', 'created_at'];
    protected $useTimestamps = false;
    protected $returnType = 'array';
}
