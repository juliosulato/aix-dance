// src/app/api/getImages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractKeyFromUrl, generatePresignedDownloadUrl } from "@/lib/s3";

export async function GET(
  request: Request,
  { params }: { params: { tenancyId: string } }
) {
  try {
    // Extract tenancyId from query params if not in route params
    const { searchParams } = new URL(request.url);
    const tenancyId = params?.tenancyId || searchParams.get('tenancyId');

    if (!tenancyId) {
      return NextResponse.json(
        { error: "tenancyId is required" },
        { status: 400 }
      );
    }

    // Fetch students from database
    const studentsFromDb = await prisma.student.findMany({
      where: {
        tenancyId: tenancyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true,
      },
    });

    // Generate signed URLs for images
    const studentsWithSignedUrls = await Promise.all(
      studentsFromDb.map(async (student) => {
        if (!student.image) {
          return student;
        }

        // Extract the S3 key from the stored URL
        const key = extractKeyFromUrl(student.image);

        if (!key) {
          console.error(`Invalid S3 URL for student ${student.id}:`, student.image);
          return student; // Return student without modifying image
        }

        try {
          // Generate signed URL valid for 15 minutes
          const signedUrl = await generatePresignedDownloadUrl(key);

          return {
            ...student,
            image: signedUrl,
          };
        } catch (error) {
          console.error(`Failed to generate signed URL for key ${key}:`, error);
          return student; // Return original URL if signing fails
        }
      })
    );

    return NextResponse.json(studentsWithSignedUrls);
  } catch (error) {
    console.error("Error fetching students with images:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}