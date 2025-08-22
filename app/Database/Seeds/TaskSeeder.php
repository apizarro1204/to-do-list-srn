<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'title' => 'Configurar entorno de desarrollo',
                'completed' => true,
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
            ],
            [
                'title' => 'Implementar API REST',
                'completed' => true,
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
            ],
            [
                'title' => 'Crear interfaz de usuario',
                'completed' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
            ],
            [
                'title' => 'Escribir documentación',
                'completed' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-30 minutes')),
            ],
            [
                'title' => 'Optimizar rendimiento',
                'completed' => false,
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];

        // Using Query Builder
        $this->db->table('tasks')->insertBatch($data);
    }
}
