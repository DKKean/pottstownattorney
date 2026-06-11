<?php
/**
 * Copy this file to form-config.php on the server and set a valid email.
 * form-config.php is not required in version control (see .gitignore).
 */
return [
  'to' => 'your-inbox@yourdomain.com',
  /** Display name in From: for the system message (not the visitor's name) */
  'fromName' => 'Bauer & Associates Website',
  /** Optional: envelope-from; must be deliverable on your host */
  'fromAddress' => null,
  'subjectPrefix' => 'Web inquiry —',
];
