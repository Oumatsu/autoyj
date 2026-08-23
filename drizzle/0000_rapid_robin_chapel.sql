CREATE TABLE `vehicle_models` (
	`id` text PRIMARY KEY NOT NULL,
	`model_id` text,
	`brand` text,
	`model` text,
	`status` text,
	`powertrain_type` text,
	`segment` text,
	`vehicle_class` text,
	`display_price_low` real,
	`display_price_high` real,
	`image_url` text,
	`hero_description` text,
	`page_title` text,
	`page_subtitle` text,
	`product_path` text,
	`cltc_range_min_km` integer,
	`cltc_range_max_km` integer,
	`battery_capacity_min_kwh` real,
	`battery_capacity_max_kwh` real,
	`motor_power_min_kw` real,
	`motor_power_max_kw` real,
	`top_speed_min_kmh` integer,
	`top_speed_max_kmh` integer,
	`zero_to_100_sec` real,
	`wheelbase_mm` integer,
	`length_mm` integer,
	`width_mm` integer,
	`height_mm` integer,
	`seats_min` integer,
	`seats_max` integer,
	`voltage_platform_v` real,
	`ground_clearance_mm` integer,
	`boot_volume_l` integer,
	`drivetrain_display` text,
	`battery_chemistry` text,
	`battery_technology` text,
	`steering_setup` text,
	`sunroof_availability` text,
	`v2l_availability` text,
	`v2l_output_power_kw` real,
	`ac_slow_charge_supported` integer,
	`ac_slow_charge_full_time_hours` real,
	`battery_warranty_years` integer,
	`battery_warranty_distance_km` integer,
	`gallery_images_json` text,
	`common_features_json` text,
	`i18n_translations` text,
	`inventory_status` text,
	`version` text,
	`airbags` integer,
	`charging` text,
	`household_charging` text,
	`model_year` integer,
	`brochure_cover` text,
	`why_section_description` text,
	`guide_price_min_usd_auto` real,
	`guide_price_max_usd_auto` real,
	`synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_models_brand` ON `vehicle_models` (`brand`);--> statement-breakpoint
CREATE INDEX `idx_vehicle_models_status` ON `vehicle_models` (`status`);--> statement-breakpoint
CREATE TABLE `vehicle_trims` (
	`id` text PRIMARY KEY NOT NULL,
	`trim_config_id` text,
	`model_id` text NOT NULL,
	`parent_model_record_id` text,
	`trim_name` text,
	`status` text,
	`display_price_low` real,
	`display_price_high` real,
	`trim_price_rmb` real,
	`powertrain_type` text,
	`cltc_range_km` integer,
	`battery_capacity_kwh` real,
	`motor_power_kw` real,
	`top_speed_kmh` integer,
	`zero_to_100_sec` real,
	`battery_chemistry` text,
	`dc_fast_charge_supported` integer,
	`dc_fast_charge_time_hours` real,
	`dc_fast_charge_min_percent` real,
	`dc_fast_charge_max_percent` real,
	`motor_torque_n_m` real,
	`drivetrain_display` text,
	`trim_order` integer,
	`recommended` integer,
	`added_features_json` text,
	`upgraded_features_json` text,
	`base_spec_summary_json` text,
	`specs_json` text,
	`synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_trims_model_id` ON `vehicle_trims` (`model_id`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text,
	`model_id` text,
	`brand` text,
	`model` text,
	`variant` text,
	`stage` text,
	`steering` text,
	`location` text,
	`supplier` text,
	`display_price_low` real,
	`display_price_high` real,
	`currency` text DEFAULT 'USD',
	`min_order_quantity` integer,
	`inventory_count` integer,
	`wait_days` integer,
	`powertrain_type` text,
	`color` text,
	`color_code` text,
	`image_url` text,
	`gallery_images_json` text,
	`specs_json` text,
	`ai_confidence_score` real,
	`exw_usd` real,
	`fca_usd` real,
	`fob_usd` real,
	`guide_price_cny` real,
	`production_year` integer,
	`production_month` integer,
	`exterior_color` text,
	`interior_color` text,
	`synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicles_model_id` ON `vehicles` (`model_id`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_no` text NOT NULL,
	`customer_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`vehicle_model` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`quantity` integer NOT NULL,
	`destination_port` text,
	`trade_term` text NOT NULL,
	`target_price` real,
	`initial_note` text,
	`vehicle_snapshot_json` text DEFAULT '' NOT NULL,
	`is_public` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`source` text DEFAULT 'Customer Portal' NOT NULL,
	`deleted_at` text,
	`deleted_by_user_id` text,
	`deleted_by_name` text,
	`deletion_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_inquiry_no_unique` ON `inquiries` (`inquiry_no`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_customer_updated` ON `inquiries` (`customer_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_deleted_at` ON `inquiries` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `inquiry_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`inquiry_no` text NOT NULL,
	`parent_note_id` text,
	`author_user_id` text NOT NULL,
	`author_name` text NOT NULL,
	`author_role` text NOT NULL,
	`body` text NOT NULL,
	`is_public` integer DEFAULT 0 NOT NULL,
	`deleted_at` text,
	`deleted_by_user_id` text,
	`deleted_by_name` text,
	`deletion_reason` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`inquiry_no`) REFERENCES `inquiries`(`inquiry_no`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiry_notes_note_id_unique` ON `inquiry_notes` (`note_id`);--> statement-breakpoint
CREATE INDEX `idx_inquiry_notes_inquiry_created` ON `inquiry_notes` (`inquiry_no`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_inquiry_notes_deleted_at` ON `inquiry_notes` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `inquiry_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_no` text NOT NULL,
	`customer_id` text,
	`user_id` text NOT NULL,
	`company` text,
	`role` text NOT NULL,
	`access_source` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`inquiry_no`) REFERENCES `inquiries`(`inquiry_no`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_inquiry_participants_user` ON `inquiry_participants` (`user_id`,`inquiry_no`);--> statement-breakpoint
CREATE TABLE `inquiry_reads` (
	`inquiry_no` text NOT NULL,
	`user_id` text NOT NULL,
	`last_read_at` text NOT NULL,
	PRIMARY KEY(`inquiry_no`, `user_id`),
	FOREIGN KEY (`inquiry_no`) REFERENCES `inquiries`(`inquiry_no`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inquiry_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`history_id` text NOT NULL,
	`inquiry_no` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`actor_user_id` text NOT NULL,
	`actor_name` text NOT NULL,
	`actor_role` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`inquiry_no`) REFERENCES `inquiries`(`inquiry_no`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiry_status_history_history_id_unique` ON `inquiry_status_history` (`history_id`);--> statement-breakpoint
CREATE INDEX `idx_inquiry_status_history_inquiry_created` ON `inquiry_status_history` (`inquiry_no`,`created_at`);--> statement-breakpoint
CREATE TABLE `negotiations` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_no` text NOT NULL,
	`quote_no` text,
	`actor_user_id` text NOT NULL,
	`actor_name` text,
	`actor_role` text,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_no` text NOT NULL,
	`inquiry_no` text NOT NULL,
	`customer_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`status` text DEFAULT 'Pending',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_no_unique` ON `orders` (`order_no`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_no` text NOT NULL,
	`inquiry_no` text NOT NULL,
	`customer_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`price` real NOT NULL,
	`status` text DEFAULT 'Active',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_quote_no_unique` ON `quotes` (`quote_no`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_userId` ON `account` (`userId`);--> statement-breakpoint
CREATE TABLE `portal_users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`telegram_chat_id` text DEFAULT '' NOT NULL,
	`telegram_username` text DEFAULT '' NOT NULL,
	`account_type` text DEFAULT 'external' NOT NULL,
	`role` text DEFAULT 'customer' NOT NULL,
	`password` text NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portal_users_email_unique` ON `portal_users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_portal_users_email` ON `portal_users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_portal_users_role` ON `portal_users` (`role`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_userId` ON `session` (`userId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT 0 NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`user_id` text,
	`customer_id` text,
	`company` text,
	`account_type` text DEFAULT 'external',
	`role` text DEFAULT 'customer',
	`status` text DEFAULT 'Active'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_email` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `user_telegram_bindings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`telegram_username` text,
	`first_name` text,
	`bound_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_telegram_chat_id` ON `user_telegram_bindings` (`chat_id`);--> statement-breakpoint
CREATE TABLE `academy_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text,
	`tag` text,
	`description` text,
	`level` text,
	`duration` text,
	`date` text,
	`content` text,
	`sort_order` integer DEFAULT 0,
	`synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academy_lessons_slug_unique` ON `academy_lessons` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_academy_lessons_slug` ON `academy_lessons` (`slug`);--> statement-breakpoint
CREATE TABLE `academy_vault` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text,
	`description` text,
	`file_size` text,
	`format` text,
	`download_url` text,
	`category` text,
	`sort_order` integer DEFAULT 0,
	`synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text,
	`date` text,
	`read_time` text,
	`cover_image` text,
	`overview` text,
	`content` text,
	`status` text DEFAULT 'Published',
	`sort_order` integer DEFAULT 0,
	`synced_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_articles_slug` ON `articles` (`slug`);--> statement-breakpoint
CREATE TABLE `public_contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
