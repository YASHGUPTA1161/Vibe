import { PrismaClient, Prisma } from "../src/generated/prisma";

const prisma = new PrismaClient();

const projectData: Prisma.ProjectCreateInput[] = [
  {
    id: "sample-project-1",
    name: "Sample Project 1",
    userId: "user-1",
  },
  {
    id: "sample-project-2", 
    name: "Sample Project 2",
    userId: "user-2",
  },
];

const usageData: Prisma.UsageCreateInput[] = [
  {
    key: "default",
    points: 100,
  },
];

export async function main() {
  // Create sample projects
  for (const project of projectData) {
    await prisma.project.create({ data: project });
  }

  // Create default usage
  for (const usage of usageData) {
    await prisma.usage.create({ data: usage });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });