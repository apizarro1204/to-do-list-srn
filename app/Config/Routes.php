<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->get('tasks', 'Tasks::index');
$routes->get('tasks/(:num)', 'Tasks::show/$1');
$routes->post('tasks', 'Tasks::create');
$routes->put('tasks/(:num)', 'Tasks::update/$1');
$routes->delete('tasks/(:num)', 'Tasks::delete/$1');
