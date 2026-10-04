-- ============================================================
-- Solar Edge Innovation - Database Schema & Initial Data
-- Hostinger MySQL Database: u987815820_solar
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: admins
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `status` ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: projects
CREATE TABLE IF NOT EXISTS `projects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(150) NULL,
    `category` VARCHAR(100) NULL,
    `image` VARCHAR(255) NULL,
    `status` ENUM('published', 'draft', 'deleted') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: project_images
CREATE TABLE IF NOT EXISTS `project_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `image_alt` VARCHAR(255) NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_project_id` (`project_id`),
    CONSTRAINT `fk_project_images_project`
        FOREIGN KEY (`project_id`)
        REFERENCES `projects` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Default Admin Account
-- Username: admin
-- Email: admin@solaredgeinnovation.in
-- Password: SolarEdge@2026!
-- ============================================================
INSERT INTO `admins` (`id`, `username`, `email`, `password`, `status`)
VALUES (
    1,
    'admin',
    'admin@solaredgeinnovation.in',
    '$2y$12$zc3DJeyouX4jETgZrpD1a.Ep4VEt8iMACMX4FRgEgW.xX7J6cUQui',
    'active'
)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- ============================================================
-- 4. Table: faqs
-- ============================================================
CREATE TABLE IF NOT EXISTS `faqs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'General',
    `sort_order` INT NOT NULL DEFAULT 0,
    `status` ENUM('published', 'draft', 'deleted') NOT NULL DEFAULT 'published',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial FAQs
INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `sort_order`, `status`) VALUES
(1, 'Do you offer free on-site solar inspections and feasibility surveys?', 'Yes! Our certified solar engineering specialists provide complimentary site surveys across Trivandrum, Kollam, and nearby regions across Kerala. We inspect your rooftop orientation, shading analysis, electrical load, and structure to calculate optimal solar yield and customized savings.', 'Residential Solar', 1, 'published'),
(2, 'Can you help us apply for PM Surya Ghar Muft Bijli Yojana subsidies?', 'Absolutely. We handle end-to-end documentation, KSEB net-metering approvals, and national subsidy portal filings for the PM Surya Ghar Muft Bijli Yojana. Eligible residential rooftop customers can claim direct central government subsidies of up to ₹78,000.', 'Residential Solar', 2, 'published'),
(3, 'How quickly does your team respond to consultation requests?', 'Our technical customer support team typically reviews all submitted inquiries and responds within 2 to 4 business hours. For urgent inquiries or immediate site visit bookings, you can also reach us directly via WhatsApp or phone at +91 95268 01406.', 'General', 3, 'published'),
(4, 'What warranties and service assurances are provided with installations?', 'We provide tier-1 MNRE/ALMM approved solar modules with up to 25 to 27 years linear power performance warranty, 5 to 10 years inverter manufacturer warranty, and comprehensive post-installation maintenance and system monitoring support.', 'General', 4, 'published'),
(5, 'Do you provide hybrid backup systems for locations with frequent power cuts?', 'Yes, our hybrid solar and inverter systems automatically switch between solar energy, battery backup, and the grid within milliseconds during blackouts, ensuring complete uninterrupted power for your lighting, fans, air conditioning, and IT equipment.', 'Inverters & Batteries', 5, 'published'),
(6, 'How much rooftop area is required for a 3kW or 5kW solar plant?', 'Typically, a 1kW solar installation requires approximately 80 to 100 square feet of shadow-free rooftop space. Therefore, a standard 3kW residential system requires around 250 to 300 sq.ft., and a 5kW system requires approximately 450 to 500 sq.ft.', 'Residential Solar', 6, 'published'),
(7, 'How does KSEB net metering work with on-grid solar systems?', 'With on-grid solar and a bi-directional KSEB net meter, excess solar power generated during peak daylight hours is exported back to the KSEB power grid. At night or during cloudy periods, you import energy as needed. You are only billed for the net units consumed, dramatically reducing or eliminating your bi-monthly electricity bill.', 'Solar', 7, 'published'),
(8, 'Do you also provide CCTV security and electrical inverter backup solutions?', 'Yes, Solar Edge Innovation offers integrated smart living services including high-definition IP & HD CCTV surveillance systems, tubular battery backup solutions, solar water heaters, and energy-efficient lightning surge protection systems.', 'CCTV', 8, 'published')
ON DUPLICATE KEY UPDATE `question` = VALUES(`question`);


-- ============================================================
-- 5. Table: admin_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT NOT NULL,
    `token` TEXT NOT NULL,
    `name` VARCHAR(100) NOT NULL DEFAULT 'Admin API Token',
    `expires_at` DATETIME NOT NULL,
    `last_used_at` DATETIME NULL,
    `status` ENUM('active', 'revoked', 'deleted') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_admin_id` (`admin_id`),
    CONSTRAINT `fk_admin_tokens_admin`
        FOREIGN KEY (`admin_id`)
        REFERENCES `admins` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Table: contact_inquiries
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `service` VARCHAR(150) NOT NULL,
    `place` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('pending', 'responded', 'deleted') NOT NULL DEFAULT 'pending',
    `responded_at` TIMESTAMP NULL DEFAULT NULL,
    `responded_by` VARCHAR(100) NULL DEFAULT NULL,
    `admin_notes` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_inquiry_status` (`status`),
    INDEX `idx_inquiry_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
