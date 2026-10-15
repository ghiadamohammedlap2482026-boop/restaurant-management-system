<?php
declare(strict_types=1);

function database_connection(): PDO
{
    $localConfigPath = __DIR__ . '/config.local.php';
    $localConfig = is_file($localConfigPath) ? require $localConfigPath : [];
    if (!is_array($localConfig)) {
        throw new RuntimeException('backend/config.local.php must return an array.');
    }
    $setting = static function (string $environmentName, string $localName, string $default) use ($localConfig): string {
        $environmentValue = getenv($environmentName);
        if ($environmentValue !== false) {
            return (string) $environmentValue;
        }
        return isset($localConfig[$localName]) ? (string) $localConfig[$localName] : $default;
    };
    $host = $setting('DB_HOST', 'host', '127.0.0.1');
    $port = $setting('DB_PORT', 'port', '3306');
    $database = $setting('DB_NAME', 'database', 'restaurant_management');
    $username = $setting('DB_USER', 'username', 'root');
    $password = $setting('DB_PASSWORD', 'password', '');

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $database);
    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
