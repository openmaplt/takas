<?php
return array(
    'resource' => array(
        'db' => array(
            'host' => '/var/run/postgresql',
            'port' => 5432,
            'dbname' => 'yourdatabase',
            'user' => '',
            'password' => '',
        ),
    ),
    'smtp' => array(
        'host'     => 'smtp.server.com',
        'port'     => 123,
        'username' => 'user@server.com',
        'password' => 'your-16-char-app-password',
        'from'     => 'sender@gmail.com',
        'from_name'=> 'Takas',
    ),
);
