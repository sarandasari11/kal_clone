-- AlterTable
ALTER TABLE `EventType` ADD COLUMN `bufferAfterMinutes` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `DateOverride` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `startTime` TIME(0) NULL,
    `endTime` TIME(0) NULL,
    `isBlocked` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DateOverride_userId_date_idx`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DateOverride` ADD CONSTRAINT `DateOverride_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
