# Agora Video/Audio Calling Integration Plan

## Overview

Integrate real-time 1-on-1 audio and video calling for doctor-patient consultations using Agora SDK. Replaces the current placeholder `video-call.tsx` screen with actual WebRTC-based calling.

**Scope:** Video + Audio, 1-on-1 only, no recording, Agora free tier.

---

## Prerequisites

### 1. Create Agora Account

1. Go to https://www.agora.io/en/ → Sign up
2. Create a new project → Choose **Secured mode** (with App Certificate)
3. Note down: `APP_ID`, `APP_CERTIFICATE`
4. Choose **Test mode** for development (free 10,000 minutes/month)

### 2. Install Packages

```bash
# Backend
cd backend && npm install agora-token

# Frontend
cd app && npx expo install react-native-agora
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Backend (NestJS)                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────┐ │
│  │ Video Module │  │ Agora Service│  │ Socket │ │
│  │ (controller) │──│ (token gen)  │  │ Events │ │
│  └──────┬──────┘  └──────┬───────┘  └───┬────┘ │
│         │                │              │       │
│  ┌──────┴──────┐  ┌──────┴───────┐      │       │
│  │VideoSession │  │  Agora REST  │      │       │
│  │  Entity     │  │  API Client  │      │       │
│  └─────────────┘  └──────────────┘      │       │
└──────────────────────────────────────────┼───────┘
                                           │
                          Socket.IO events │
              ┌────────────────────────────┼──────────┐
              │  Frontend (Expo/RN)        │          │
              │  ┌──────────────┐  ┌───────┴──────┐  │
              │  │ Agora RN SDK │  │ Call Manager │  │
              │  │(RtcEngine)   │  │ (hook)       │  │
              │  └──────┬───────┘  └──────────────┘  │
              │         │                            │
              │  ┌──────┴───────┐  ┌──────────────┐  │
              │  │ Video Call   │  │ Incoming Call │  │
              │  │ Screen       │  │ Modal        │  │
              │  └──────────────┘  └──────────────┘  │
              └──────────────────────────────────────┘
```

---

## Phase 1: Backend — Agora Module

### New Files

```
backend/src/
  video-call/
    video-call.module.ts
    video-call.controller.ts
    video-call.service.ts
    video-call.entity.ts
    dto/
      create-session.dto.ts
```

### 1.1 Entity: `VideoSession`

```typescript
// video-call.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('video_sessions')
export class VideoSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointmentId: number;

  @Column()
  channelName: string; // Agora channel (appointment ID as string)

  @Column({ default: 'WAITING' })
  status: 'WAITING' | 'ACTIVE' | 'ENDED';

  @Column('int', { nullable: true })
  doctorUserId: number;

  @Column('int', { nullable: true })
  patientId: number;

  @Column('timestamptz', { nullable: true })
  startedAt: Date;

  @Column('timestamptz', { nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 1.2 Service: Token Generation + Session Management

```typescript
// video-call.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { VideoSession } from './video-call.entity';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class VideoCallService {
  constructor(
    @InjectRepository(VideoSession)
    private readonly sessionRepo: Repository<VideoSession>,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  /**
   * Generate RTC token for Agora.
   * - channelName: room identifier (use appointment ID as string)
   * - uid: user ID (Agora expects integer, use userId)
   * - role: 'publisher' (can send audio/video) or 'subscriber' (receive only)
   * - expiry: token validity in seconds (24h for dev, shorter for prod)
   */
  generateRtcToken(channelName: string, uid: number, role: 'publisher' | 'subscriber' = 'publisher'): string {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      throw new BadRequestException('Agora credentials not configured');
    }

    const tokenExpire = 86400; // 24 hours (duration in seconds)
    const privilegeExpire = 86400;
    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    return RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      agoraRole,
      tokenExpire,
      privilegeExpire,
    );
  }

  /**
   * Create a new video session when doctor initiates call.
   */
  async createSession(appointmentId: number, doctorUserId: number): Promise<VideoSession> {
    const appointment = await this.appointmentsService.findOne(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorUserId) {
      throw new BadRequestException('Only the assigned doctor can start this call');
    }

    // Check if session already exists
    const existing = await this.sessionRepo.findOne({ where: { appointmentId } });
    if (existing && existing.status !== 'ENDED') {
      return existing; // Return existing active session
    }

    const channelName = `appointment-${appointmentId}`;

    const session = this.sessionRepo.create({
      appointmentId,
      channelName,
      doctorUserId,
      patientId: appointment.patientId,
      status: 'WAITING',
    });

    return this.sessionRepo.save(session);
  }

  /**
   * Join a session: validate appointment ownership, return token + channel info.
   */
  async joinSession(
    appointmentId: number,
    userId: number,
    role: string,
  ): Promise<{ token: string; channelName: string; appId: string }> {
    const session = await this.sessionRepo.findOne({ where: { appointmentId } });
    if (!session) {
      throw new NotFoundException('No active call for this appointment');
    }

    if (session.status === 'ENDED') {
      throw new BadRequestException('This call has ended');
    }

    // Validate user is part of this appointment
    const appointment = await this.appointmentsService.findOne(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const isDoctor = appointment.doctorId === userId;
    const isPatient = appointment.patientId === userId;

    if (!isDoctor && !isPatient) {
      throw new BadRequestException('You are not part of this consultation');
    }

    // Update session status to ACTIVE
    if (session.status === 'WAITING') {
      session.status = 'ACTIVE';
      session.startedAt = new Date();
      await this.sessionRepo.save(session);
    }

    const token = this.generateRtcToken(session.channelName, userId);

    return {
      token,
      channelName: session.channelName,
      appId: process.env.AGORA_APP_ID,
    };
  }

  /**
   * End a session.
   */
  async endSession(appointmentId: number, userId: number): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { appointmentId } });
    if (!session) {
      throw new NotFoundException('No active call for this appointment');
    }

    // Validate user is part of this session
    if (session.doctorUserId !== userId && session.patientId !== userId) {
      throw new BadRequestException('You are not part of this consultation');
    }

    session.status = 'ENDED';
    session.endedAt = new Date();
    await this.sessionRepo.save(session);
  }

  /**
   * Get or create session (used by appointments join endpoint).
   */
  async getOrCreateSession(appointmentId: number): Promise<VideoSession> {
    let session = await this.sessionRepo.findOne({ where: { appointmentId } });
    if (!session || session.status === 'ENDED') {
      const appointment = await this.appointmentsService.findOne(appointmentId);
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      const channelName = `appointment-${appointmentId}`;
      session = this.sessionRepo.create({
        appointmentId,
        channelName,
        doctorUserId: appointment.doctorId,
        patientId: appointment.patientId,
        status: 'WAITING',
      });
      session = await this.sessionRepo.save(session);
    }
    return session;
  }
}
```

### 1.3 Controller Endpoints

```typescript
// video-call.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { VideoCallService } from './video-call.service';

@ApiTags('Video Call')
@Controller('video-call')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VideoCallController {
  constructor(private readonly videoCallService: VideoCallService) {}

  /**
   * Doctor initiates a call for an appointment.
   */
  @Post('create')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create a video call session (doctor only)' })
  async create(
    @CurrentUser() user: any,
    @Body() body: { appointmentId: number },
  ) {
    const session = await this.videoCallService.createSession(
      body.appointmentId,
      user.sub,
    );
    return { sessionId: session.id, channelName: session.channelName };
  }

  /**
   * Both doctor and patient join the call.
   */
  @Post('join/:appointmentId')
  @ApiOperation({ summary: 'Join a video call session' })
  async join(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.videoCallService.joinSession(
      parseInt(appointmentId, 10),
      user.sub,
      user.role,
    );
  }

  /**
   * End the call.
   */
  @Post('end/:appointmentId')
  @ApiOperation({ summary: 'End a video call session' })
  async end(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: any,
  ) {
    await this.videoCallService.endSession(
      parseInt(appointmentId, 10),
      user.sub,
    );
    return { success: true };
  }

  /**
   * Get fresh token (for reconnection).
   */
  @Get('token/:appointmentId')
  @ApiOperation({ summary: 'Get fresh Agora token for reconnection' })
  async getToken(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.videoCallService.joinSession(
      parseInt(appointmentId, 10),
      user.sub,
      user.role,
    );
  }
}
```

### 1.4 Module Definition

```typescript
// video-call.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoSession } from './video-call.entity';
import { VideoCallService } from './video-call.service';
import { VideoCallController } from './video-call.controller';
import { AppointmentsModule } from '../appointments/appointments.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoSession]),
    AppointmentsModule,
    AuthModule,
  ],
  controllers: [VideoCallController],
  providers: [VideoCallService],
  exports: [VideoCallService],
})
export class VideoCallModule {}
```

### 1.5 Socket Call Signaling

Add call events to the existing `ChatGateway` (or create a new `CallGateway`):

```typescript
// Add to chat.gateway.ts (or new call.gateway.ts)

// Emit when doctor starts call
notifyCallStarted(patientId: number, payload: any): void {
  this.server.to(`user:${patientId}`).emit('callStarted', payload);
}

// Emit when call ends
notifyCallEnded(userId: number, payload: any): void {
  this.server.to(`user:${userId}`).emit('callEnded', payload);
}

// Emit when patient accepts/rejects
notifyCallResponse(doctorUserId: number, payload: any): void {
  this.server.to(`user:${doctorUserId}`).emit('callResponse', payload);
}
```

### 1.6 Update Appointments Join Endpoint

```typescript
// appointments.service.ts - replace placeholder getJoinInfo
async getJoinInfo(appointmentId: number, requesterId: number, requesterRole: UserRole) {
  const session = await this.videoCallService.getOrCreateSession(appointmentId);
  return {
    channelName: session.channelName,
    token: this.videoCallService.generateRtcToken(session.channelName, requesterId),
    appId: process.env.AGORA_APP_ID,
  };
}
```

---

## Phase 2: Frontend — Call Flow

### New Files

```
app/src/
  hooks/
    use-agora.ts            # Agora engine management hook
    use-call-signaling.ts   # Socket events for call state
  components/
    CallControls.tsx        # Mute, camera flip, end call buttons
    IncomingCallModal.tsx   # Incoming call notification
    VideoPlayer.tsx         # Local + remote video views
  lib/
    agora-manager.ts        # Singleton RtcEngine setup
```

### 2.1 Agora Manager (Singleton)

```typescript
// lib/agora-manager.ts
import {
  createAgoraRtcEngine,
  RtcEngine,
  ChannelProfileType,
  ClientRoleType,
  VideoEncoderConfigurationBase,
} from 'react-native-agora';

class AgoraManager {
  private engine: RtcEngine | null = null;

  async init(appId: string): Promise<void> {
    this.engine = createAgoraRtcEngine();
    this.engine.initialize({ appId });
    this.engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
    this.engine.enableVideo();
    this.engine.setVideoEncoderConfiguration({
      dimensions: { width: 640, height: 360 },
      frameRate: 30,
      bitrateMin: 400,
      bitrateMax: 1500,
    });
  }

  async join(channelToken: string, channelName: string, uid: number): Promise<void> {
    await this.engine?.joinChannel(channelToken, channelName, uid, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
  }

  async leave(): Promise<void> {
    await this.engine?.leaveChannel();
  }

  async toggleMute(): Promise<boolean> {
    // Returns new muted state
    return false;
  }

  async toggleCamera(): Promise<boolean> {
    // Returns new camera-off state
    return false;
  }

  async switchCamera(): Promise<void> {
    await this.engine?.switchCamera();
  }

  getEngine(): RtcEngine | null {
    return this.engine;
  }

  destroy(): void {
    this.engine?.release();
    this.engine = null;
  }
}

export const agoraManager = new AgoraManager();
```

### 2.2 useAgora Hook

```typescript
// hooks/use-agora.ts
import { useState, useEffect, useCallback } from 'react';
import { agoraManager } from '@/lib/agora-manager';
import type { RtcConnection, RemoteVideoState } from 'react-native-agora';

interface AgoraState {
  localUid: number | null;
  remoteUids: number[];
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isFrontCamera: boolean;
}

export function useAgora(
  appointmentId: number,
  token: string,
  channelName: string,
  appId: string,
) {
  const [state, setState] = useState<AgoraState>({
    localUid: null,
    remoteUids: [],
    isConnected: false,
    isMuted: false,
    isCameraOff: false,
    isFrontCamera: true,
  });

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      await agoraManager.init(appId);
      const engine = agoraManager.getEngine();
      if (!engine || !mounted) return;

      engine.addListener('onJoinChannelSuccess', (connection: RtcConnection, uid: number) => {
        if (mounted) {
          setState(prev => ({ ...prev, localUid: uid, isConnected: true }));
        }
      });

      engine.addListener('onUserJoined', (connection: RtcConnection, uid: number) => {
        if (mounted) {
          setState(prev => ({ ...prev, remoteUids: [...prev.remoteUids, uid] }));
        }
      });

      engine.addListener('onUserOffline', (connection: RtcConnection, uid: number) => {
        if (mounted) {
          setState(prev => ({ ...prev, remoteUids: prev.remoteUids.filter(id => id !== uid) }));
        }
      });

      engine.addListener('onLeaveChannel', () => {
        if (mounted) {
          setState(prev => ({ ...prev, localUid: null, remoteUids: [], isConnected: false }));
        }
      });

      await agoraManager.join(token, channelName, parseInt(token, 10) || 0);
    };

    setup();

    return () => {
      mounted = false;
      agoraManager.leave();
    };
  }, [appointmentId, token, channelName, appId]);

  const toggleMute = useCallback(async () => {
    const engine = agoraManager.getEngine();
    if (!engine) return;
    await engine.muteLocalAudioStream(!state.isMuted);
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [state.isMuted]);

  const toggleCamera = useCallback(async () => {
    const engine = agoraManager.getEngine();
    if (!engine) return;
    await engine.muteLocalVideoStream(!state.isCameraOff);
    setState(prev => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  }, [state.isCameraOff]);

  const switchCamera = useCallback(async () => {
    await agoraManager.switchCamera();
    setState(prev => ({ ...prev, isFrontCamera: !prev.isFrontCamera }));
  }, []);

  return {
    ...state,
    toggleMute,
    toggleCamera,
    switchCamera,
  };
}
```

### 2.3 useCallSignaling Hook

```typescript
// hooks/use-call-signaling.ts
import { useEffect, useState } from 'react';
import { socketManager } from '@/lib/socket-manager';
import { useRouter } from 'expo-router';

interface IncomingCall {
  appointmentId: number;
  doctorName: string;
  channelName: string;
}

export function useCallSignaling(userId: number | undefined) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const handleCallStarted = (payload: {
      appointmentId: number;
      doctorName: string;
      channelName: string;
    }) => {
      setIncomingCall(payload);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    const handleCallResponse = (payload: { accepted: boolean; appointmentId: number }) => {
      if (payload.accepted) {
        // Doctor navigates to call screen
      }
    };

    socketManager.on('callStarted', handleCallStarted);
    socketManager.on('callEnded', handleCallEnded);
    socketManager.on('callResponse', handleCallResponse);

    return () => {
      socketManager.off('callStarted', handleCallStarted);
      socketManager.off('callEnded', handleCallEnded);
      socketManager.off('callResponse', handleCallResponse);
    };
  }, [userId]);

  const acceptCall = () => {
    if (incomingCall) {
      setIncomingCall(null);
      router.push({
        pathname: '/video-call',
        params: {
          appointmentId: incomingCall.appointmentId,
          doctorName: incomingCall.doctorName,
        },
      });
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socketManager.emit('callResponse', {
        accepted: false,
        appointmentId: incomingCall.appointmentId,
      });
      setIncomingCall(null);
    }
  };

  return { incomingCall, acceptCall, rejectCall };
}
```

### 2.4 Updated `video-call.tsx` Screen

```typescript
// app/src/app/video-call.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RtcLocalView, RtcRemoteView } from 'react-native-agora';
import { useAgora } from '@/hooks/use-agora';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import { CallControls } from '@/components/CallControls';
import { API_URL } from '@/constants/api';

export default function VideoCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    appointmentId?: string;
    doctorName?: string;
  }>();

  const appointmentId = params.appointmentId ? parseInt(params.appointmentId, 10) : 0;
  const doctorName = params.doctorName || 'Doctor';

  const [callData, setCallData] = useState<{
    token: string;
    channelName: string;
    appId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Fetch call data from backend
  useEffect(() => {
    const fetchCallData = async () => {
      try {
        const response = await fetch(`${API_URL}/video-call/join/${appointmentId}`, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        const data = await response.json();
        setCallData(data);
      } catch (error) {
        console.error('Failed to join call:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCallData();
  }, [appointmentId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    localUid,
    remoteUids,
    isConnected,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    switchCamera,
  } = useAgora(appointmentId, callData?.token || '', callData?.channelName || '', callData?.appId || '');

  const handleEndCall = async () => {
    await fetch(`${API_URL}/video-call/end/${appointmentId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    setCallEnded(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BD632F" />
        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Remote Video (full screen) */}
      {remoteUids.length > 0 && (
        <RtcRemoteView.SurfaceView
          style={styles.videoBackground}
          uid={remoteUids[0]}
          channelId={callData?.channelName || ''}
          renderMode={1}
        />
      )}

      {/* Local Video (PiP) */}
      {localUid && (
        <View style={styles.pipContainer}>
          <RtcLocalView.SurfaceView
            style={styles.pipBox}
            channelId={callData?.channelName || ''}
            renderMode={1}
          />
        </View>
      )}

      {/* Status Bar */}
      <SafeAreaView style={styles.statusBar} />

      {/* Top Controls */}
      <TouchableOpacity style={styles.backBtnTop} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Doctor Name & Timer */}
      <View style={styles.callInfoOverlay}>
        <Text style={styles.callDoctorName}>{doctorName}</Text>
        <Text style={styles.callTimer}>{formatTimer(elapsed)}</Text>
        {!isConnected && <Text style={styles.connectingText}>Connecting...</Text>}
      </View>

      {/* Bottom Control Bar */}
      <CallControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onSwitchCamera={switchCamera}
        onEndCall={handleEndCall}
      />

      {/* Call Ended Modal */}
      <Modal visible={callEnded} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>Consultation ended!</Text>
            <Text style={styles.modalSubtitle}>Your consultation has ended successfully.</Text>
            <TouchableOpacity
              style={styles.modalHomeBtn}
              onPress={() => router.replace('/(tabs)/doctor-home')}
            >
              <Text style={styles.modalHomeBtnText}>Back to home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 16 },
  videoBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtnTop: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  pipContainer: { position: 'absolute', top: 50, right: 20 },
  pipBox: { width: 100, height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF' },
  callInfoOverlay: { position: 'absolute', bottom: 160, left: 0, right: 0, alignItems: 'center' },
  callDoctorName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  callTimer: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  connectingText: { fontSize: 12, color: '#FFC107', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%' },
  modalCheckCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1817', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, fontWeight: '500', color: '#7C7672', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalHomeBtn: { backgroundColor: '#BD632F', borderRadius: 26, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' },
  modalHomeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
```

### 2.5 CallControls Component

```typescript
// components/CallControls.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onSwitchCamera,
  onEndCall,
}: CallControlsProps) {
  return (
    <View style={styles.controlBar}>
      <TouchableOpacity style={styles.controlBtn} onPress={onToggleCamera}>
        <Ionicons
          name={isCameraOff ? 'videocam-off' : 'videocam'}
          size={22}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlBtn} onPress={onToggleMute}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic'}
          size={22}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlBtn} onPress={onSwitchCamera}>
        <Ionicons name="camera-reverse" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.endCallBtn} onPress={onEndCall}>
        <Ionicons name="call" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controlBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 2.6 IncomingCallModal Component

```typescript
// components/IncomingCallModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IncomingCallModalProps {
  visible: boolean;
  doctorName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({
  visible,
  doctorName,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Incoming Call</Text>
          <Text style={styles.subtitle}>{doctorName}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Ionicons name="videocam" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1A1817',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7C7672',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 24,
  },
  rejectBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## Phase 3: Environment Config

### Backend `.env` Additions

```
# Agora Video Call Configuration
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
```

### Backend `.env.example` Additions

```
# Agora Video Call Configuration (required for video consultations)
# Get from: https://console.agora.io/
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
```

---

## Phase 4: Database Migration

```sql
-- Migration: Add video_sessions table
CREATE TABLE video_sessions (
  id SERIAL PRIMARY KEY,
  "appointmentId" INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  "channelName" VARCHAR(255) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'WAITING',
  "doctorUserId" INTEGER,
  "patientId" INTEGER,
  "startedAt" TIMESTAMPTZ,
  "endedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_sessions_appointment ON video_sessions("appointmentId");
CREATE INDEX idx_video_sessions_status ON video_sessions("status");
```

---

## Phase 5: Update App Module

```typescript
// app.module.ts - add VideoCallModule
import { VideoCallModule } from './video-call/video-call.module';

@Module({
  imports: [
    // ... existing modules
    VideoCallModule,
  ],
})
export class AppModule {}
```

---

## Implementation Order

| Step | What | Files | Status |
|------|------|-------|--------|
| 1 | Create Agora account, get keys | Manual | ✅ DONE |
| 2 | Backend: `agora-token` + `.env` | `package.json`, `.env` | ✅ DONE |
| 3 | Backend: VideoSession entity | `video-call.entity.ts` | ✅ DONE |
| 4 | Backend: VideoCall service + controller | `video-call.service.ts`, `video-call.controller.ts` | ✅ DONE |
| 5 | Backend: Module definition | `video-call.module.ts` | ✅ DONE |
| 6 | Backend: Update appointments join endpoint | `appointments.service.ts` | ✅ DONE |
| 7 | Backend: Register module in AppModule | `app.module.ts` | ✅ DONE |
| 8 | Frontend: `react-native-agora` install | `package.json` | ⏳ TODO |
| 9 | Frontend: Agora manager | `lib/agora-manager.ts` | ⏳ TODO |
| 10 | Frontend: useAgora hook | `hooks/use-agora.ts` | ⏳ TODO |
| 11 | Frontend: useCallSignaling hook | `hooks/use-call-signaling.ts` | ⏳ TODO |
| 12 | Frontend: CallControls component | `components/CallControls.tsx` | ⏳ TODO |
| 13 | Frontend: IncomingCallModal component | `components/IncomingCallModal.tsx` | ⏳ TODO |
| 14 | Frontend: Video call screen rewrite | `video-call.tsx` | ⏳ TODO |
| 15 | Test end-to-end | Manual testing | ⏳ TODO |

---

## Testing Checklist

- [ ] Doctor can initiate call from appointment
- [ ] Patient receives incoming call notification
- [ ] Patient can accept/reject call
- [ ] Both parties see video/audio streams
- [ ] Mute/unmute audio works
- [ ] Camera on/off works
- [ ] Switch camera (front/back) works
- [ ] End call works for both parties
- [ ] Call ends when one party leaves
- [ ] Reconnection works if connection drops
- [ ] Call duration timer is accurate
- [ ] Token refresh works for long calls
- [ ] Works on both iOS and Android

---

## Estimated Effort

| Phase | Hours |
|-------|-------|
| Backend (entity + service + controller + module) | 4-6 |
| Frontend (hooks + components + screen) | 6-8 |
| Socket signaling + incoming call flow | 2-3 |
| Testing + bug fixes | 2-3 |
| **Total** | **14-20 hours** |

---

## Notes

- **Token expiry:** 24 hours for development. For production, consider shorter expiry (1-2 hours) with refresh endpoint.
- **Channel naming:** Using `appointment-{id}` ensures uniqueness and easy mapping.
- **Role mapping:** Agora UID uses the user's integer ID from the database.
- **No recording:** Per requirements, no cloud recording. Can be added later.
- **1-on-1 only:** Channel profile is `Communication` (not `LiveBroadcasting`).
- **Video quality:** 640x360 at 30fps balances quality and bandwidth.
- **Fallback:** If Agora SDK fails to initialize, show error state with retry option.




