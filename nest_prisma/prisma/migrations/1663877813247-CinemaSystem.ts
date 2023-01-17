import { PrismaService } from '../../src/prisma/prisma.service';
import { Migration } from '../cli/migration';

const prisma = new PrismaService();
export default class implements Migration {
  async up() {
    /**
     # ToDo: Create a migration that creates all tables for the following user stories

     For an example on how a UI for an api using this might look like, please try to book a show at https://in.bookmyshow.com/.
     To not introduce additional complexity, please consider only one cinema.

     Please list the tables that you would create including keys, foreign keys and attributes that are required by the user stories.

     ## User Stories

     **Movie exploration**
     * As a user I want to see which films can be watched and at what times
     * As a user I want to only see the shows which are not booked out

     **Show administration**
     * As a cinema owner I want to run different films at different times
     * As a cinema owner I want to run multiple films at the same time in different showrooms

     **Pricing**
     * As a cinema owner I want to get paid differently per show
     * As a cinema owner I want to give different seat types a percentage premium, for example 50 % more for vip seat

     **Seating**
     * As a user I want to book a seat
     * As a user I want to book a vip seat/couple seat/super vip/whatever
     * As a user I want to see which seats are still available
     * As a user I want to know where I'm sitting on my ticket
     * As a cinema owner I dont want to configure the seating for every show
     */

    // throw new Error('TODO: implement migration in task 4');
    try {
      await prisma.$queryRaw`CREATE TABLE "showrooms" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "name" TEXT NOT NULL,
          "seatCount" INTEGER NOT NULL DEFAULT 0,
          "time" DATETIME NOT NULL,
          "isBookedForShow" BOOLEAN NOT NULL DEFAULT false,
          "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

      await prisma.$queryRaw`CREATE TABLE "seat" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "rows" INTEGER NOT NULL DEFAULT 0,
          "columns" INTEGER NOT NULL DEFAULT 0,
          "isBookedForShow" BOOLEAN NOT NULL DEFAULT false,
          "seatTypeId" INTEGER NOT NULL,
          "showroomId" INTEGER NOT NULL,
          "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "seat_seatTypeId_fkey" FOREIGN KEY ("seatTypeId") REFERENCES "seatingType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "seat_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "showrooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`;

      await prisma.$queryRaw`CREATE TABLE "seatingType" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "type" TEXT NOT NULL DEFAULT 'Regular',
          "fareRate" REAL NOT NULL DEFAULT 0,
          "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

      await prisma.$queryRaw`CREATE TABLE "shows" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "name" TEXT NOT NULL,
          "time" DATETIME NOT NULL,
          "price" REAL NOT NULL,
          "isBooked" BOOLEAN NOT NULL DEFAULT false,
          "showroomId" INTEGER NOT NULL,
          "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "shows_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "showrooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`;

      await prisma.$queryRaw`CREATE TABLE "booking" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL,
          "showId" INTEGER NOT NULL,
          "seatId" INTEGER NOT NULL,
          "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "booking_showId_fkey" FOREIGN KEY ("showId") REFERENCES "shows" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "booking_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`;

      await prisma.$queryRaw`CREATE INDEX "showrooms_isBookedForShow_idx" ON "showrooms"("isBookedForShow")`;

      await prisma.$queryRaw`CREATE INDEX "seat_showroomId_isBookedForShow_rows_columns_idx" ON "seat"("showroomId", "isBookedForShow", "rows", "columns")`;

      await prisma.$queryRaw`CREATE INDEX "shows_showroomId_isBooked_time_idx" ON "shows"("showroomId", "isBooked", "time" DESC)`;

      await prisma.$queryRaw`CREATE INDEX "booking_userId_idx" ON "booking"("userId")`;
    } catch (e) {
      console.error(e);
    } finally {
      await prisma.$disconnect();
    }
  }

  async down() {
    await prisma.$queryRaw`DROP INDEX "booking_userId_idx"`;
    await prisma.$queryRaw`DROP INDEX "shows_showroomId_isBooked_time_idx"`;
    await prisma.$queryRaw`DROP INDEX "seat_showroomId_isBookedForShow_rows_columns_idx"`;
    await prisma.$queryRaw`DROP INDEX "showrooms_isBookedForShow_idx"`;
    await prisma.$queryRaw`DROP TABLE "booking"`;
    await prisma.$queryRaw`DROP TABLE "shows"`;
    await prisma.$queryRaw`DROP TABLE "seatingType"`;
    await prisma.$queryRaw`DROP TABLE "seat"`;
    await prisma.$queryRaw`DROP TABLE "showrooms"`;
  }
}
