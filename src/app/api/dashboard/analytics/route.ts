import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Note from "@/models/Note";
import AIHistory from "@/models/AIHistory";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(authUser.id);

    const [
      totalNotes,
      archivedNotes,
      recentActivity
    ] = await Promise.all([
      Note.countDocuments({ userId: userObjectId, archived: false }),
      Note.countDocuments({ userId: userObjectId, archived: true }),
      Note.find({ userId: userObjectId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title updatedAt")
        .lean()
    ]);

    const topTags = await Note.aggregate([
      { 
        $match: { 
          userId: userObjectId, 
          archived: false 
        } 
      },
      { 
        $unwind: "$tags" 
      },
      { 
        $group: { 
          _id: "$tags",
          count: { $sum: 1 } 
        } 
      },
      { 
        $sort: { count: -1 } 
      },
      { 
        $limit: 5 
      },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagDetails"
        }
      },
      { $unwind: "$tagDetails" },
      {
        $project: {
          _id: 0,
          tag: "$tagDetails.name",
          count: 1
        }
      }
    ]);

    const aiUsage = await AIHistory.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const totalAiGenerations = aiUsage.reduce((acc, curr) => acc + curr.count, 0);
    const aiUsageBreakdown = aiUsage.map(usage => ({
      type: usage._id,
      count: usage.count
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalNotes,
        archivedNotes,
        topTags,
        recentActivity: recentActivity.map(note => ({
          _id: note._id,
          title: note.title,
          updatedAt: note.updatedAt
        })),
        aiUsage: {
          total: totalAiGenerations,
          breakdown: aiUsageBreakdown
        }
      }
    });

  } catch (error) {
    console.error("ANALYTICS_ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
