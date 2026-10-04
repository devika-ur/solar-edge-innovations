<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Auto-detect Laravel base path
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    $corePath = __DIR__ . '/..';
} elseif (file_exists(__DIR__ . '/../laravel-core/vendor/autoload.php')) {
    $corePath = __DIR__ . '/../laravel-core';
} elseif (file_exists(__DIR__ . '/laravel-core/vendor/autoload.php')) {
    $corePath = __DIR__ . '/laravel-core';
} else {
    $corePath = __DIR__ . '/..';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $corePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $corePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $corePath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
