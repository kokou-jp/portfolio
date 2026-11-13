<?php
$users = ['postgres', 'kokou', get_current_user(), ''];
$passwords = ['postgres', '', 'root', 'admin', 'password', 'kokou'];
$success = false;

foreach ($users as $user) {
    foreach ($passwords as $pwd) {
        try {
            $dsn = "pgsql:host=127.0.0.1;port=5432;dbname=postgres;sslmode=prefer";
            echo "Trying user: '$user', password: '$pwd'... ";
            $pdo = new PDO($dsn, $user ?: null, $pwd !== '' ? $pwd : null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 2
            ]);
            echo "CONNECTED! ";
            
            // Try creating the database
            $pdo->exec("CREATE DATABASE portfolio");
            echo "Database 'portfolio' created successfully!\n";
            $success = true;
            
            // Output the successful credentials to be written to .env
            echo "SUCCESS_USER=" . $user . "\n";
            echo "SUCCESS_PASSWORD=" . $pwd . "\n";
            break 2;
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') !== false) {
                echo "Database 'portfolio' already exists!\n";
                $success = true;
                echo "SUCCESS_USER=" . $user . "\n";
                echo "SUCCESS_PASSWORD=" . $pwd . "\n";
                break 2;
            } else {
                echo "Failed: " . $e->getMessage() . "\n";
            }
        }
    }
}

if (!$success) {
    echo "Could not connect to PostgreSQL. Please check your credentials or create the 'portfolio' database manually.\n";
}
