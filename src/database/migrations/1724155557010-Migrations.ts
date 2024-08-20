import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1724155557010 implements MigrationInterface {
  name = 'Migrations1724155557010';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE \`suspended_users\` ADD CONSTRAINT \`FK_09c5ab1060c74412ed202178e89\` FOREIGN KEY (\`suspended_user_id\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` ADD CONSTRAINT \`FK_b25fe995a9ffc2e1b17f6d5a01a\` FOREIGN KEY (\`reporterUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` ADD CONSTRAINT \`FK_d23065d1b9e7480e0f5d451a8a5\` FOREIGN KEY (\`reportedPersonUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`logins\` ADD CONSTRAINT \`FK_7ac150951f482e8071322afa7b6\` FOREIGN KEY (\`login_user_id\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` ADD CONSTRAINT \`FK_f85d2ecef51056545344f024a64\` FOREIGN KEY (\`reporterUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` ADD CONSTRAINT \`FK_911227effb4cd6c9b89fc52feb6\` FOREIGN KEY (\`reportedPersonUserId\`) REFERENCES \`users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` DROP FOREIGN KEY \`FK_911227effb4cd6c9b89fc52feb6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_comments\` DROP FOREIGN KEY \`FK_f85d2ecef51056545344f024a64\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`logins\` DROP FOREIGN KEY \`FK_7ac150951f482e8071322afa7b6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` DROP FOREIGN KEY \`FK_d23065d1b9e7480e0f5d451a8a5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`report_posts\` DROP FOREIGN KEY \`FK_b25fe995a9ffc2e1b17f6d5a01a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suspended_users\` DROP FOREIGN KEY \`FK_09c5ab1060c74412ed202178e89\``,
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
    await queryRunner.query(`DROP TABLE \`report_comments\``);
    await queryRunner.query(
      `DROP INDEX \`REL_7ac150951f482e8071322afa7b\` ON \`logins\``,
    );
    await queryRunner.query(`DROP TABLE \`logins\``);
    await queryRunner.query(`DROP TABLE \`report_posts\``);
    await queryRunner.query(
      `DROP INDEX \`REL_09c5ab1060c74412ed202178e8\` ON \`suspended_users\``,
    );
    await queryRunner.query(`DROP TABLE \`suspended_users\``);
    await queryRunner.query(`DROP TABLE \`exam_prep\``);
    await queryRunner.query(`DROP TABLE \`likes\``);
    await queryRunner.query(`DROP TABLE \`event\``);
    await queryRunner.query(`DROP TABLE \`employment\``);
    await queryRunner.query(`DROP TABLE \`scraps\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`theory\``);
    await queryRunner.query(`DROP TABLE \`job\``);
    await queryRunner.query(`DROP TABLE \`practice\``);
    await queryRunner.query(`DROP TABLE \`notice\``);
    await queryRunner.query(`DROP TABLE \`base_posts\``);
    await queryRunner.query(`DROP TABLE \`comments\``);
    await queryRunner.query(`DROP TABLE \`replies\``);
  }
}
