import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Sample data for generating random users
const firstNames = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
  "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
  "Abigail", "Michael", "Emily", "Daniel", "Elizabeth", "Matthew", "Sofia", "Jackson", "Avery", "Sebastian"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const cities = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Boston, MA"
];

const bios = [
  "Love hiking, coffee, and good conversations. Looking for someone who enjoys adventure!",
  "Foodie, traveler, and dog lover. Let's explore the world together.",
  "Fitness enthusiast and book worm. Balance is key!",
  "Software engineer by day, musician by night. Love live music and concerts.",
  "Yoga instructor passionate about wellness and mindfulness.",
  "Entrepreneur with a love for innovation and new experiences.",
  "Teacher who loves making a difference. Looking for meaningful connections.",
  "Photographer capturing life's beautiful moments. Art and nature lover.",
  "Chef experimenting with new recipes. Food is my love language!",
  "Marketing professional who loves creativity and strategic thinking.",
  "Medical professional dedicated to helping others. Compassion is everything.",
  "Architect designing dreams. Let's build something beautiful together.",
  "Financial analyst with a passion for investing and travel.",
  "Writer crafting stories. Love deep conversations and coffee shops.",
  "Environmental scientist fighting for a better planet.",
];

const photoUrls = [
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/women/1.jpg",
  "https://randomuser.me/api/portraits/men/2.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
  "https://randomuser.me/api/portraits/women/3.jpg",
  "https://randomuser.me/api/portraits/men/4.jpg",
  "https://randomuser.me/api/portraits/women/4.jpg",
  "https://randomuser.me/api/portraits/men/5.jpg",
  "https://randomuser.me/api/portraits/women/5.jpg",
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomAge() {
  return Math.floor(Math.random() * (45 - 22 + 1)) + 22; // 22-45
}

function randomGender() {
  return randomElement(["MALE", "FEMALE", "OTHER"] as const);
}

export async function POST(req: Request) {
  try {
    const { count = 20 } = await req.json();

    if (count > 100) {
      return NextResponse.json(
        { error: "Maximum 100 users at a time" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    const createdUsers = [];

    for (let i = 0; i < count; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@test.com`;
      const age = randomAge();
      const gender = randomGender();
      const location = randomElement(cities);
      const bio = randomElement(bios);

      try {
        // Create user with profile and photo
        const user = await prisma.user.create({
          data: {
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            profile: {
              create: {
                age,
                gender,
                location,
                bio,
              },
            },
            photos: {
              create: {
                url: randomElement(photoUrls),
              },
            },
            subscription: {
              create: {
                status: Math.random() > 0.7 ? "ACTIVE" : "INACTIVE",
                plan: Math.random() > 0.7 ? "PREMIUM" : "FREE",
              },
            },
          },
          include: {
            profile: true,
            photos: true,
            subscription: true,
          },
        });

        createdUsers.push(user);
      } catch (error: any) {
        // Skip if email already exists
        if (error.code === "P2002") {
          console.log(`Skipped duplicate email: ${email}`);
          continue;
        }
        throw error;
      }
    }

    // Create some random matches between users (30% chance of mutual match)
    const allUsers = await prisma.user.findMany({
      select: { id: true },
      take: 100,
    });

    let matchCount = 0;
    for (let i = 0; i < Math.min(allUsers.length * 2, 50); i++) {
      const user1 = randomElement(allUsers);
      const user2 = randomElement(allUsers.filter(u => u.id !== user1.id));

      if (!user2) continue;

      try {
        const match = await prisma.match.create({
          data: {
            initiatorId: user1.id,
            receiverId: user2.id,
            status: Math.random() > 0.5 ? "ACCEPTED" : "PENDING",
          },
        });
        matchCount++;

        // If mutual match, create some messages
        if (match.status === "ACCEPTED" && Math.random() > 0.6) {
          await prisma.message.createMany({
            data: [
              {
                senderId: user1.id,
                receiverId: user2.id,
                content: "Hey! How are you doing?",
                isRead: Math.random() > 0.5,
              },
              {
                senderId: user2.id,
                receiverId: user1.id,
                content: "Hi! I'm great, thanks for asking! How about you?",
                isRead: Math.random() > 0.5,
              },
              {
                senderId: user1.id,
                receiverId: user2.id,
                content: "Doing well! Would love to chat more.",
                isRead: Math.random() > 0.3,
              },
            ],
          });
        }
      } catch (error: any) {
        // Skip duplicate matches
        if (error.code === "P2002") continue;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdUsers.length} test users with profiles and photos`,
      users: createdUsers.length,
      matches: matchCount,
      credentials: {
        email: "Any user email from the list above",
        password: "password123",
      },
      sampleUsers: createdUsers.slice(0, 5).map(u => ({
        email: u.email,
        name: u.name,
        age: u.profile?.age,
        location: u.profile?.location,
      })),
    });
  } catch (error: any) {
    console.error("Bulk user creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create users" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clean up test data
export async function DELETE() {
  try {
    // Delete all test users (with @test.com email)
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: "@test.com",
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} test users and their related data`,
      deleted: result.count,
    });
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete test users" },
      { status: 500 }
    );
  }
}
