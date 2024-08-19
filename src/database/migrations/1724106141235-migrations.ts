import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1724106141235 implements MigrationInterface {
  name = 'Migrations1724106141235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`replies\` (\`repliesId\` int NOT NULL AUTO_INCREMENT, \`content\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`commentsCommentId\` int NULL, PRIMARY KEY (\`repliesId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`comments\` (\`commentId\` int NOT NULL AUTO_INCREMENT, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`postPostId\` int NULL, PRIMARY KEY (\`commentId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`base_posts\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`practice\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`userId\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`nickname\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`membershipStatus\` enum ('0', '1', '2', '3', '4') NOT NULL DEFAULT '0', \`studentStatus\` enum ('current_student', 'alumni') NOT NULL DEFAULT 'current_student', \`certificationDocumentUrl\` varchar(255) NOT NULL, PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`scraps\` (\`scrapId\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userUserId\` int NULL, \`postPostId\` int NULL, PRIMARY KEY (\`scrapId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`theory\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`job\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notice\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_prep\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`event\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`employment\` (\`postId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isReported\` tinyint NOT NULL DEFAULT 0, \`scrapCounts\` int NOT NULL DEFAULT '0', \`viewCounts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`postId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`likes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userUserId\` int NULL, \`postPostId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`report_comments\` (\`reportCommentId\` int NOT NULL AUTO_INCREMENT, \`reportedCommentId\` int NOT NULL, \`reportedContent\` text NOT NULL, \`dateReported\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reporterUserId\` int NULL, \`reportedPersonUserId\` int NULL, PRIMARY KEY (\`reportCommentId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`report_posts\` (\`reportPostId\` int NOT NULL AUTO_INCREMENT, \`reportedPostId\` int NOT NULL, \`reportedContent\` text NOT NULL, \`dateReported\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reporterUserId\` int NULL, \`reportedPersonUserId\` int NULL, PRIMARY KEY (\`reportPostId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`replies\` ADD CONSTRAINT \`FK_469a5516414379333d07a4d28be\` FOREIGN KEY (\`commentsCommentId\`) REFERENCES \`comments\`(\`commentId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_0ddfafc6ae13de3ae3e24b36dd4\` FOREIGN KEY (\`postPostId\`) REFERENCES \`base_posts\`(\`postId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`scraps\` ADD CONSTRAINT \`FK_1d4507b7cf71039043b33e51977\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`scraps\` ADD CONSTRAINT \`FK_7fc494c59c4acf12cf2f1e9f33f\` FOREIGN KEY (\`postPostId\`) REFERENCES \`base_posts\`(\`postId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_7699af221310daf20de0a5139f2\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_f6577e0f10bd794973cfc02544f\` FOREIGN KEY (\`postPostId\`) REFERENCES \`base_posts\`(\`postId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` ADD CONSTRAINT \`FK_f85d2ecef51056545344f024a64\` FOREIGN KEY (\`reporterUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` ADD CONSTRAINT \`FK_911227effb4cd6c9b89fc52feb6\` FOREIGN KEY (\`reportedPersonUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` ADD CONSTRAINT \`FK_b25fe995a9ffc2e1b17f6d5a01a\` FOREIGN KEY (\`reporterUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` ADD CONSTRAINT \`FK_d23065d1b9e7480e0f5d451a8a5\` FOREIGN KEY (\`reportedPersonUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` DROP FOREIGN KEY \`FK_d23065d1b9e7480e0f5d451a8a5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` DROP FOREIGN KEY \`FK_b25fe995a9ffc2e1b17f6d5a01a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` DROP FOREIGN KEY \`FK_911227effb4cd6c9b89fc52feb6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` DROP FOREIGN KEY \`FK_f85d2ecef51056545344f024a64\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_f6577e0f10bd794973cfc02544f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_7699af221310daf20de0a5139f2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`scraps\` DROP FOREIGN KEY \`FK_7fc494c59c4acf12cf2f1e9f33f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`scraps\` DROP FOREIGN KEY \`FK_1d4507b7cf71039043b33e51977\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_0ddfafc6ae13de3ae3e24b36dd4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`replies\` DROP FOREIGN KEY \`FK_469a5516414379333d07a4d28be\``,
    );
    await queryRunner.query(`DROP TABLE \`report_posts\``);
    await queryRunner.query(`DROP TABLE \`report_comments\``);
    await queryRunner.query(`DROP TABLE \`likes\``);
    await queryRunner.query(`DROP TABLE \`employment\``);
    await queryRunner.query(`DROP TABLE \`event\``);
    await queryRunner.query(`DROP TABLE \`exam_prep\``);
    await queryRunner.query(`DROP TABLE \`notice\``);
    await queryRunner.query(`DROP TABLE \`job\``);
    await queryRunner.query(`DROP TABLE \`theory\``);
    await queryRunner.query(`DROP TABLE \`scraps\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`practice\``);
    await queryRunner.query(`DROP TABLE \`base_posts\``);
    await queryRunner.query(`DROP TABLE \`comments\``);
    await queryRunner.query(`DROP TABLE \`replies\``);
  }
}
