"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuthUser } from "@/context/AuthUserContext";
import { db } from "@/lib/firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";

import { generateQrPayload } from "@/services/qr";
import { generatePdf } from "@/services/pdf";
import styles from "./profile.module.css";

export default function ProfileDashboard() {
  const { currentUser, loading } = useAuthUser();
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef(null);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && !currentUser) router.replace("/login");
    if (currentUser)
      setName(
        `${currentUser.personal?.firstName} ${currentUser.personal?.lastName}`
      );
  }, [loading, currentUser]);

  const handleShowQr = async () => {
    if (!currentUser?.qrEnabled) {
      toast.error("You must register in an event to unlock Entry Pass");
      return;
    }

    const payload = generateQrPayload({
      anweshaId: currentUser.anweshaId,
      firstName: currentUser.personal?.firstName,
      lastName: currentUser.personal?.lastName,
      email: currentUser.email,
      contact: currentUser.contact?.phone,
      college: currentUser.college?.name,
      dob: currentUser.personal?.dob,
      gender: currentUser.personal?.gender,
    });

    try {
      await updateDoc(doc(db, "users", currentUser.uid), { qrTokenId: payload });
      setQrValue(payload);
      toast.success("QR Generated!");
    } catch {
      toast.error("Failed generating QR");
    }
  };

  if (loading || !currentUser) return null;

  return (
    <div className={styles.mainContainer}>
      {/* Header */}
      <div className={styles.welcome}>WELCOME BACK!</div>

      <div className={styles.subContainer}>
        {/* Header Section Left (Avatar, Name, ID) and QR Right */}
        <div className={styles.profileHeader}>
          {/* Avatar + Name */}
          <div className={styles.leftSide}>
            <div className={styles.userImage}>
              <img src="/pics/circle_greenNobg.png" width={180} height={180} alt="bg" />
              <img src="/pics/mascot 2.png" width={130} height={130} alt="mascot" />
            </div>

            <div>
              {/* Name + Edit Row */}
              <div className={styles.nameBlock}>
                <h1 className={styles.anwesha_username}>{name}</h1>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={styles.iconBtn}
                >
                  <motion.div whileTap={{ scale: 0.8 }}>
                    <img
                      src={isEditing ? "/assets/tick.svg" : "/edit.svg"}
                      width={22}
                      height={22}
                      alt="edit"
                    />
                  </motion.div>
                </button>

                {isEditing && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                    autoFocus
                    className={styles.nameEditInput}
                  />
                )}
              </div>


              {/* Anwesha ID Block */}
              <div className={styles.idBlock}>
                <span className={styles.anwesha_id}>{currentUser.anweshaId}</span>

                <button
                  className={styles.iconBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser.anweshaId);
                    toast.success("Copied!");
                  }}
                >
                  <motion.div whileTap={{ scale: 0.8 }}>
                    <Image src="/copy.svg" width={22} height={22} alt="copy" />
                  </motion.div>
                </button>
              </div>

            </div>
          </div>

          {/* QR Area */}
          <div className={styles.rightSide}>
            {qrValue ? (
              <QRCode value={qrValue} size={170} />
            ) : (
              <button className={styles.qrGenerateBtn} onClick={handleShowQr}>
                View Entry Pass
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* User Details */}
        <div className={styles.userDetails}>
          <div>
            <h1 className={styles.userDetailsHeading}>Mail ID</h1>
            <h1 className={styles.userDetailsContent}>{currentUser.email}</h1>
          </div>

          <div>
            <h1 className={styles.userDetailsHeading}>Mobile Number</h1>
            <h1 className={styles.userDetailsContent}>{currentUser.contact?.phone}</h1>
          </div>

          <div>
            <h1 className={styles.userDetailsHeading}>Institute / Organization</h1>
            <h1 className={styles.userDetailsContent}>{currentUser.college?.name}</h1>
          </div>
        </div>

        {/* Registered Events Section */}
        {Array.isArray(currentUser.events) && currentUser.events.length > 0 && (
          <section className={styles.eventSection}>

            {/* Heading now larger + bold */}
            <h2 className={styles.sectionTitle}>Registered Events</h2>

            <div className={styles.eventGrid}>
              {currentUser.events.map((event, index) => (
                <div className={styles.eventCard} key={index}>

                  {/* Inline on Desktop — stacked on Phone */}
                  <div className={styles.eventRow}>
                    <p><strong>Event ID:</strong> {event.eventId}</p>
                    <p><strong>Team ID:</strong> {event.teamId}</p>
                    <p><strong>Payment ID:</strong> {event.paymentId}</p>
                    <p><strong>Amount:</strong> ₹{event.amount}</p>
                  </div>

                  {event.paymentId && (
                    <button
                      onClick={() => generatePdf(currentUser, event, qrRef)}
                      className={styles.eventButton}
                    >
                      Download Receipt
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hidden QR for PDF Rendering */}
        <div ref={qrRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
          {qrValue && <QRCode value={qrValue} size={150} />}
        </div>

        {/* Accommodation Info */}
        <h2 className={styles.accommodationText}>
          To seek accommodation, fill this&nbsp;
          <a
            href="https://forms.gle/WjTuyC2gR8mHYGzA6"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "skyblue" }}
          >
            FORM
          </a>
        </h2>
      </div>
    </div>
  );
}
