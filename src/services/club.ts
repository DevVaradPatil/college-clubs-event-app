import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getFirestoreInstance } from "./firebase";
import { store } from "../store";
import {
  fetchClubStart,
  fetchClubSuccess,
  fetchMembersStart,
  fetchMembersSuccess,
  updateClubStart,
  updateClubSuccess,
  clubFailure,
} from "../store/slices/clubsSlice";
import type { Club, ClubMember, ClubApplication } from "../types/club";

export class ClubService {
  // Get club data by ID
  static async getClubById(clubId: string): Promise<Club | null> {
    try {
      store.dispatch(fetchClubStart());

      const db = getFirestoreInstance();
      const clubDoc = await getDoc(doc(db, "clubs", clubId));

      if (!clubDoc.exists()) {
        store.dispatch(clubFailure("Club not found"));
        return null;
      }

      const clubData = clubDoc.data() as Club;
      store.dispatch(fetchClubSuccess(clubData));
      return clubData;
    } catch (error: any) {
      console.error("Error fetching club data:", error);
      store.dispatch(clubFailure(error.message || "Failed to fetch club data"));
      throw error;
    }
  }

  // Update club details
  static async updateClubDetails(
    clubId: string,
    clubData: Partial<Club>
  ): Promise<Club> {
    try {
      store.dispatch(updateClubStart());

      const db = getFirestoreInstance();
      const clubRef = doc(db, "clubs", clubId);

      // First, get current club data
      const currentClubDoc = await getDoc(clubRef);
      if (!currentClubDoc.exists()) {
        throw new Error("Club not found");
      }

      // Clean up club data to remove undefined values (Firestore doesn't accept undefined)
      const cleanClubData = Object.entries(clubData).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // Update the updatedAt timestamp
      const updatedClub = {
        ...cleanClubData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(clubRef, updatedClub);

      // Get the updated club document
      const updatedClubDoc = await getDoc(clubRef);

      if (!updatedClubDoc.exists()) {
        throw new Error("Club document not found after update");
      }

      const finalClubData = updatedClubDoc.data() as Club;
      store.dispatch(updateClubSuccess(finalClubData));
      return finalClubData;
    } catch (error: any) {
      console.error("Error updating club details:", error);
      store.dispatch(
        clubFailure(error.message || "Failed to update club details")
      );
      throw error;
    }
  }

  // Get club members
  static async getClubMembers(clubId: string): Promise<ClubMember[]> {
    try {
      store.dispatch(fetchMembersStart());

      const db = getFirestoreInstance();
      const membersQuery = query(
        collection(db, "clubMembers"),
        where("clubId", "==", clubId)
      );

      const membersSnapshot = await getDocs(membersQuery);
      const members: ClubMember[] = [];

      membersSnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() } as ClubMember);
      });

      store.dispatch(fetchMembersSuccess(members));
      return members;
    } catch (error: any) {
      console.error("Error fetching club members:", error);
      store.dispatch(
        clubFailure(error.message || "Failed to fetch club members")
      );
      throw error;
    }
  }

  // Add a new member to club
  static async addClubMember(
    clubId: string,
    memberData: Omit<ClubMember, "id">
  ): Promise<ClubMember> {
    try {
      const db = getFirestoreInstance();
      const memberId = `${clubId}_${memberData.userId}`;

      const newMember: ClubMember = {
        ...memberData,
        id: memberId,
        joinedAt: new Date().toISOString(),
        status: "active",
      };

      await setDoc(doc(db, "clubMembers", memberId), newMember);

      // Update member count in club document
      await this.updateClubMemberCount(clubId, 1);

      // Reload members to update Redux state
      await this.getClubMembers(clubId);

      return newMember;
    } catch (error) {
      console.error("Error adding club member:", error);
      throw error;
    }
  }

  // Update club member count
  private static async updateClubMemberCount(
    clubId: string,
    change: number
  ): Promise<void> {
    try {
      const db = getFirestoreInstance();
      const clubRef = doc(db, "clubs", clubId);
      const clubDoc = await getDoc(clubRef);

      if (!clubDoc.exists()) {
        throw new Error("Club not found");
      }

      const club = clubDoc.data() as Club;
      const newMemberCount = Math.max(0, (club.memberCount || 0) + change);

      await updateDoc(clubRef, {
        memberCount: newMemberCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating club member count:", error);
      throw error;
    }
  }

  // Get club stats
  static async getClubStats(clubId: string): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    totalMembers: number;
    activeRegistrations: number;
  }> {
    try {
      const db = getFirestoreInstance();

      // Get members count
      const members = await this.getClubMembers(clubId);

      // Get all events for this club
      const eventsQuery = query(
        collection(db, "events"),
        where("clubId", "==", clubId)
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events: any[] = [];

      eventsSnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });

      // Calculate upcoming events
      const now = new Date();
      const upcomingEvents = events.filter((e) => new Date(e.startDate) > now);

      // Count active registrations for all events
      let activeRegistrations = 0;
      const eventIds = events.map((e) => e.id);

      if (eventIds.length > 0) {
        // Only query if we have events
        const registrationsQuery = query(
          collection(db, "eventRegistrations"),
          where("eventId", "in", eventIds.slice(0, 10)), // Firestore limits 'in' queries to 10 items
          where("status", "==", "registered")
        );

        const registrationsSnapshot = await getDocs(registrationsQuery);
        activeRegistrations = registrationsSnapshot.size;

        // If we have more than 10 events, make additional queries
        if (eventIds.length > 10) {
          for (let i = 10; i < eventIds.length; i += 10) {
            const batch = eventIds.slice(i, i + 10);
            if (batch.length > 0) {
              const batchQuery = query(
                collection(db, "eventRegistrations"),
                where("eventId", "in", batch),
                where("status", "==", "registered")
              );

              const batchSnapshot = await getDocs(batchQuery);
              activeRegistrations += batchSnapshot.size;
            }
          }
        }
      }

      return {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        totalMembers: members.length,
        activeRegistrations,
      };
    } catch (error) {
      console.error("Error fetching club stats:", error);
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        totalMembers: 0,
        activeRegistrations: 0,
      };
    }
  }

  // Get all clubs (for students to browse and apply)
  static async getAllClubs(): Promise<Club[]> {
    try {
      const db = getFirestoreInstance();
      const clubsQuery = query(
        collection(db, "clubs"),
        where("isActive", "==", true),
        where("isPublic", "==", true)
      );

      const clubsSnapshot = await getDocs(clubsQuery);
      const clubs: Club[] = [];

      clubsSnapshot.forEach((doc) => {
        clubs.push({ id: doc.id, ...doc.data() } as Club);
      });

      return clubs;
    } catch (error: any) {
      console.error("Error fetching clubs:", error);
      throw error;
    }
  }

  // Submit club application
  static async submitClubApplication(
    application: Omit<ClubApplication, "id" | "applicationDate" | "status">
  ): Promise<void> {
    try {
      const db = getFirestoreInstance();
      const applicationId = `${application.clubId}_${application.applicantId}`;

      const applicationData: ClubApplication = {
        ...application,
        id: applicationId,
        applicationDate: new Date().toISOString(),
        status: "pending",
      };

      await setDoc(doc(db, "clubApplications", applicationId), applicationData);
    } catch (error) {
      console.error("Error submitting club application:", error);
      throw error;
    }
  }

  // Get club applications (for club leaders)
  static async getClubApplications(clubId: string): Promise<ClubApplication[]> {
    try {
      const db = getFirestoreInstance();
      const applicationsQuery = query(
        collection(db, "clubApplications"),
        where("clubId", "==", clubId),
        where("status", "==", "pending")
      );

      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications: ClubApplication[] = [];

      applicationsSnapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() } as ClubApplication);
      });

      return applications;
    } catch (error) {
      console.error("Error fetching club applications:", error);
      throw error;
    }
  }

  // Accept/reject club application
  static async processClubApplication(
    applicationId: string,
    status: "accepted" | "rejected",
    responseMessage?: string,
    reviewedBy?: string
  ): Promise<void> {
    try {
      const db = getFirestoreInstance();
      const applicationRef = doc(db, "clubApplications", applicationId);

      await updateDoc(applicationRef, {
        status,
        responseMessage: responseMessage || "",
        reviewedBy: reviewedBy || "",
        reviewedAt: new Date().toISOString(),
      });

      // If accepted, add the user as a club member
      if (status === "accepted") {
        const applicationDoc = await getDoc(applicationRef);
        if (applicationDoc.exists()) {
          const application = applicationDoc.data() as ClubApplication;

          await this.addClubMember(application.clubId, {
            userId: application.applicantId,
            clubId: application.clubId,
            name: application.applicantName,
            email: application.applicantEmail,
            role: "member",
            status: "active",
            joinedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error processing club application:", error);
      throw error;
    }
  }

  // Transfer club leadership
  static async transferClubLeadership(
    clubId: string,
    newLeaderId: string,
    currentLeaderId: string
  ): Promise<void> {
    try {
      const db = getFirestoreInstance();

      // Update club document
      await updateDoc(doc(db, "clubs", clubId), {
        currentLeaderId: newLeaderId,
        updatedAt: new Date().toISOString(),
      });

      // Update club members roles
      await updateDoc(doc(db, "clubMembers", `${clubId}_${currentLeaderId}`), {
        role: "member",
      });

      await updateDoc(doc(db, "clubMembers", `${clubId}_${newLeaderId}`), {
        role: "president",
      });

      // Update user's managedClubs arrays
      const currentLeaderRef = doc(db, "users", currentLeaderId);
      const newLeaderRef = doc(db, "users", newLeaderId);

      const currentLeaderDoc = await getDoc(currentLeaderRef);
      const newLeaderDoc = await getDoc(newLeaderRef);

      if (currentLeaderDoc.exists()) {
        const currentLeaderData = currentLeaderDoc.data();
        const updatedManagedClubs = (
          currentLeaderData.managedClubs || []
        ).filter((id: string) => id !== clubId);
        await updateDoc(currentLeaderRef, {
          managedClubs: updatedManagedClubs,
        });
      }

      if (newLeaderDoc.exists()) {
        const newLeaderData = newLeaderDoc.data();
        const updatedManagedClubs = [
          ...(newLeaderData.managedClubs || []),
          clubId,
        ];
        await updateDoc(newLeaderRef, { managedClubs: updatedManagedClubs });
      }
    } catch (error) {
      console.error("Error transferring club leadership:", error);
      throw error;
    }
  }

  // Remove club member
  static async removeClubMember(clubId: string, userId: string): Promise<void> {
    try {
      const db = getFirestoreInstance();
      const memberId = `${clubId}_${userId}`;

      // Remove from clubMembers collection
      await updateDoc(doc(db, "clubMembers", memberId), {
        status: "inactive",
      });

      // Update member count
      await this.updateClubMemberCount(clubId, -1);

      // Update user's joinedClubs array
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedJoinedClubs = (userData.joinedClubs || []).filter(
          (id: string) => id !== clubId
        );
        await updateDoc(userRef, { joinedClubs: updatedJoinedClubs });
      }
    } catch (error) {
      console.error("Error removing club member:", error);
      throw error;
    }
  }
}
