import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { 
  LayoutDashboard, 
  Scan, 
  CheckSquare, 
  User as UserIcon,
  Zap,
  Camera,
  ChevronRight,
  TrendingUp,
  Award,
  LogOut,
  Sparkles,
  Loader2,
  RefreshCw,
  Upload,
  Download,
  Clock,
  Globe,
  Mic,
  Utensils,
  Scissors,
  Layers,
  Activity,
  History,
  Info,
  ChevronLeft,
  Share2,
  MoreVertical,
  X,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle } from './lib/firebase';
import { 
  analyzeFacialFeatures, 
  analyzePosture, 
  analyzeNutrition, 
  simulateAesthetics, 
  analyzeVocalResonance 
} from './gemini';
import { 
  UserProfile, 
  ScanResult, 
  Task, 
  Routine, 
  PostureResult, 
  SimulationResult, 
  NutritionResult, 
  VocalResult,
  Post,
  ComparisonResult
} from './types';
import MarkDown from 'react-markdown';
import FaceCoach from './components/FaceCoach';

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

const getGuideInstructions = (title: string) => {
  if (title.includes('Jawline')) return "Place your knuckles on the center of your chin. Apply firm pressure and sweep upwards along the jawline towards the base of your ears. Release and repeat.";
  if (title.includes('Gua Sha')) return "Using a Gua Sha or fingers, start from your nasal folds. Sweep outwards across the cheekbones, then drain downwards along the side of the neck.";
  if (title.includes('Eye')) return "Gently press two fingers under the arch of your eyebrow. Sweep outwards towards the temples. Do not stretch the skin too harshly.";
  if (title.includes('Lift')) return "Place palms on your temples. Firmly compress the muscle and pull diagonally upwards towards the hairline. Hold this tension and breathe deeply.";
  return "Follow the 3D hologram's movement precisely. Breathe through your nose.";
};

const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid || 'anonymous',
        email: auth.currentUser?.email || '',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || true,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }

  if (error.message?.includes('Quota exceeded')) {
    console.error("Firestore Quota exceeded. It will reset the next day.");
  }

  if (error.code === 'unavailable') {
    console.error("Firestore backend is currently unavailable. The app will work offline.");
  }

  throw error;
};

// Global Log Proxy
const useLogger = () => {
  const originalLog = console.log;
  const originalError = console.error;
  
  useEffect(() => {
    // We don't want to infinite loop, so we only track meaningful logs if desired
    // For now we'll just expose it to App state via custom system
  }, []);
};

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';

type View = 'dashboard' | 'scan' | 'routines' | 'profile' | 'leaderboard' | 'evolution' | 'simulator' | 'social' | 'nutrition' | 'voice' | 'posture' | 'guides' | 'arsenal';

const ElitePaywallModal = ({ onClose, onUpgrade }: { onClose: () => void, onUpgrade: () => void }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleSubscribe = () => {
    setStatus('processing');
    // Simulate payment gateway routing delay
    setTimeout(() => {
      setStatus('success');
      // Upgrade local/remote user state
      setTimeout(() => {
        onUpgrade();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={status === 'processing' ? undefined : onClose} />
      <div className="bg-ios-bg border border-ios-glass-border shadow-2xl rounded-[32px] p-8 max-w-sm w-full relative z-10 text-center overflow-hidden transition-all">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-600" />
         
         {status === 'success' ? (
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8">
             <div className="w-16 h-16 bg-ios-green rounded-full flex items-center justify-center mx-auto mb-4 scale-up-center">
               <Sparkles className="text-white fill-white" size={32} />
             </div>
             <h2 className="text-2xl font-black text-ios-green mb-2 tracking-tight">Elite Unlocked</h2>
             <p className="text-sm font-medium text-ios-secondary-label">Welcome to the inner circle.</p>
           </motion.div>
         ) : (
           <>
             {status === 'processing' ? (
                <div className="py-6">
                  <Loader2 className="mx-auto text-amber-500 mb-4 animate-spin" size={48} />
                   <h2 className="text-xl font-bold mb-2 blink">Processing...</h2>
                   <p className="text-xs text-ios-secondary-label">Connecting to secure gateway</p>
                </div>
             ) : (
                <>
                  <Zap size={48} className="mx-auto text-amber-500 mb-4" />
                  <h2 className="text-3xl font-black mb-2">Maximus <span className="text-amber-500">Elite</span></h2>
                  <p className="text-sm text-ios-secondary-label font-medium mb-6">Unlock generative AI features, personalized supplement blueprints, and unlimited scans.</p>
                  <button onClick={handleSubscribe} className="w-full bg-[#1C1C1E] text-white py-4 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 mb-2 shadow-xl shadow-black/20">
                     Subscribe $9.99/mo
                  </button>
                  <button onClick={onClose} className="text-xs text-ios-secondary-label font-bold uppercase tracking-widest p-2">
                     Restore Purchases
                  </button>
                </>
             )}
           </>
         )}
      </div>
    </div>
  )
}

const MewingTimerBlock = () => {
  const [mewingActive, setMewingActive] = useState(false);
  const [mewingSeconds, setMewingSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (mewingActive) {
      interval = setInterval(() => {
        setMewingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mewingActive]);

  return (
    <div className="bento-full bg-white relative overflow-hidden mb-8">
      {mewingActive && <div className="mewing-aura" />}
      <div className="relative z-10 text-center py-10">
        <p className="label-cap text-ios-blue">Mewing Focus Session</p>
        <h2 className="text-6xl font-black tracking-tighter my-4">
          {Math.floor(mewingSeconds / 60)}:{(mewingSeconds % 60).toString().padStart(2, '0')}
        </h2>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => setMewingActive(!mewingActive)}
            className={`ios-btn-primary flex-1 max-w-[200px] ${mewingActive ? 'bg-ios-red shadow-ios-red/30' : 'neon-glow-blue'}`}
          >
            {mewingActive ? 'Stop Protocol' : 'Initiate Mewing'}
          </button>
          <button 
            onClick={() => { setMewingActive(false); setMewingSeconds(0); }}
            className="ios-btn-secondary px-4 flex items-center justify-center"
            title="Reset Timer"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        <p className="text-[10px] font-bold text-ios-secondary-label mt-4 uppercase tracking-[0.2em]">Tongue up. Chin level. Breathe through nose.</p>
      </div>
    </div>
  );
};

const GuideTimerBlock = ({ durationMinutes, onComplete }: { durationMinutes: string, onComplete: () => void }) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const durationSeconds = parseInt(durationMinutes) * 60;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev >= durationSeconds) {
          clearInterval(interval);
          onComplete();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [durationMinutes, onComplete]);

  return (
    <div className="inline-flex bg-ios-blue/10 text-ios-blue px-6 py-2 rounded-full font-bold tracking-widest text-lg items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-ios-blue animate-pulse" />
      {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
    </div>
  );
};

export default function App() {
  const [showEliteModal, setShowEliteModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanTab, setScanTab] = useState<'overview' | 'analysis' | 'plan' | 'flex'>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [theme, setTheme] = useState<'lunar' | 'obsidian'>('lunar');
  const [expandedScore, setExpandedScore] = useState<string | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  // Specific Elite States
  const [postureResult, setPostureResult] = useState<PostureResult | null>(null);
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);
  const [vocalResult, setVocalResult] = useState<VocalResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [socialPosts, setSocialPosts] = useState<Post[]>([]);
  const [comparingScans, setComparingScans] = useState<[string, string] | null>(null);
  const [activeGuide, setActiveGuide] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'error', id: string}[]>([]);

  const addLog = (msg: string, type: 'info' | 'error' = 'info') => {
    setLogs(prev => [...prev.slice(-19), { msg, type, id: Math.random().toString(36).slice(2) }]);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flexCardRef = useRef<HTMLDivElement>(null);

  // Auth & Profile Listener
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsOffline(false);
        addLog("Maximus Matrix: Online");
      } catch (error: any) {
        if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
          console.error("Please check your Firebase configuration or internet connection.");
          setIsOffline(true);
          addLog("System: Offline Protocol Active", "error");
        }
      }
    }
    testConnection();

    const savedTheme = localStorage.getItem('maximus-theme') as 'lunar' | 'obsidian';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid)).catch(e => handleFirestoreError(e, 'get', `users/${firebaseUser.uid}`));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile({
              ...data,
              aura: data.aura || 0,
              achievements: data.achievements || []
            });
          } else {
            const newProfile: UserProfile = {
              userId: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Maximus User',
              email: firebaseUser.email || '',
              avatarUrl: firebaseUser.photoURL || '',
              overallScore: 0,
              aura: 100, // Starting Aura
              achievements: [
                { id: '1', title: 'Novice Candidate', icon: '🐣', unlockedAt: new Date().toISOString() }
              ],
              streak: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile).catch(e => handleFirestoreError(e, 'create', `users/${firebaseUser.uid}`));
            setProfile(newProfile);
          }
        } catch (e) {
          console.error("Error fetching profile:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'lunar' ? 'obsidian' : 'lunar';
    setTheme(newTheme);
    localStorage.setItem('maximus-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Fetch Logic (Scans & Routines)
  useEffect(() => {
    if (!user) return;

    const scansQuery = query(
      collection(db, 'users', user.uid, 'scans'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubScans = onSnapshot(scansQuery, 
      (snapshot) => {
        setRecentScans(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => handleFirestoreError(error, 'list', `users/${user.uid}/scans`)
    );

    const routinesQuery = collection(db, 'users', user.uid, 'routines');
    const unsubRoutines = onSnapshot(routinesQuery, 
      (snapshot) => {
        if (!snapshot.empty) {
          const routine = snapshot.docs[0].data() as Routine;
          setTasks(routine.tasks);
        } else {
          // Initial tasks
          const defaultTasks: Task[] = [
            { id: '1', text: 'Apply sunscreen', completed: false, category: 'Skincare' },
            { id: '2', text: 'Stand up straight (Posture check)', completed: false, category: 'Posture' },
            { id: '3', text: 'Clean shave or beard trim', completed: false, category: 'Grooming' },
            { id: '4', text: 'Gua Sha / Face massage', completed: false, category: 'Skincare' }
          ];
          setDoc(doc(db, 'users', user.uid, 'routines', 'daily'), {
            userId: user.uid,
            title: 'Daily Maximus',
            tasks: defaultTasks
          }).catch(e => handleFirestoreError(e, 'create', `users/${user.uid}/routines/daily`));
        }
      },
      (error) => handleFirestoreError(error, 'list', `users/${user.uid}/routines`)
    );

    // Leaderboard
    const leaderboardQuery = query(
      collection(db, 'users'),
      orderBy('overallScore', 'desc'),
      limit(10)
    );
    const unsubLeaderboard = onSnapshot(leaderboardQuery, 
      (snapshot) => {
        setLeaderboard(snapshot.docs.map(d => d.data()));
      },
      (error) => handleFirestoreError(error, 'list', 'users')
    );

    // Social Feed
    const socialQuery = query(
      collection(db, 'social_feed'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubSocial = onSnapshot(socialQuery, 
      (snapshot) => {
        setSocialPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Post));
      },
      (error) => handleFirestoreError(error, 'list', 'social_feed')
    );

    return () => {
      unsubScans();
      unsubRoutines();
      unsubLeaderboard();
      unsubSocial();
    };
  }, [user]);

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.8; // Masculine/Deep
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getTier = (score: number) => {
    if (score >= 95) return { name: 'Diamond Elite', color: 'text-cyan-400' };
    if (score >= 85) return { name: 'Platinum', color: 'text-gray-300' };
    if (score >= 75) return { name: 'Gold', color: 'text-amber-400' };
    if (score >= 60) return { name: 'Silver', color: 'text-gray-400' };
    return { name: 'Bronze', color: 'text-amber-600' };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = (e.target?.result as string).split(',')[1];
      setScanning(true);
      setCurrentView('scan');
      try {
        const result = await analyzeFacialFeatures(base64Image);
        setScanResult(result);
        addLog(`Protocol: Scan Success (${result.scores.overall})`);
        
        const scanData = {
          userId: user.uid,
          photoUrl: '', // In a real app, upload to storage first
          timestamp: new Date().toISOString(),
          scores: result.scores || { symmetry: 0, jawline: 0, skin: 0, eyes: 0, overall: 0 },
          scoreExplanations: result.scoreExplanations || { symmetry: "N/A", jawline: "N/A", skin: "N/A", eyes: "N/A" },
          feedback: result.feedback || "No feedback generated.",
          recommendations: result.recommendations || [],
          improvementPlan: result.improvementPlan || { daily: [], weekly: [], lifestyle: [], groomingAdvice: "N/A" },
          dailyInsight: result.dailyInsight || "Consistency is key.",
          recommendedIngredients: result.recommendedIngredients || []
        };
        
        await addDoc(collection(db, 'users', user.uid, 'scans'), scanData).catch(e => handleFirestoreError(e, 'create', `users/${user.uid}/scans`));

        // Update user overall score & Aura
        const newAura = (profile?.aura || 0) + 10;
        const updates: any = {
          overallScore: Math.max(result.scores.overall, profile?.overallScore || 0),
          aura: newAura
        };
        
        // Check for achievements
        const newAchievements = [...(profile?.achievements || [])];
        if (result.scores.overall >= 90 && !newAchievements.find(a => a.id === '90-club')) {
          newAchievements.push({ id: '90-club', title: 'Adonis Tier', icon: '🔱', unlockedAt: new Date().toISOString() });
        }
        updates.achievements = newAchievements;

        await updateDoc(doc(db, 'users', user.uid), {
          ...updates
        }).catch(e => handleFirestoreError(e, 'update', `users/${user.uid}`));
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      } catch (err) {
        console.error("Upload analysis failed", err);
        alert("Analysis failed.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostureScan = async (base64Image: string) => {
    if (!user) return;
    setScanning(true);
    addLog("Structural Integrity: Initializing Scan...");
    setCurrentView('posture');
    try {
      const result = await analyzePosture(base64Image);
      setPostureResult(result);
      addLog("Structural Scan: Complete");
      // Boost aura for checking posture
      await updateDoc(doc(db, 'users', user.uid), { aura: (profile?.aura || 0) + 15 })
        .catch(e => handleFirestoreError(e, 'update', `users/${user.uid}`));
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleNutritionScan = async (base64Image: string) => {
    if (!user) return;
    setScanning(true);
    addLog("Nutrition Protocol: Analyzing Edema Risk...");
    setCurrentView('nutrition');
    try {
      const result = await analyzeNutrition(base64Image);
      setNutritionResult(result);
      addLog("Nutrition Analysis: Complete");
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleSimulationScan = async (base64Image: string) => {
    if (!user) return;
    setScanning(true);
    setCurrentView('simulator');
    try {
      const result = await simulateAesthetics(base64Image);
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleVocalAnalysis = async (base64Audio: string) => {
    if (!user) return;
    setScanning(true);
    addLog("Acoustic Protocol: Processing Tonality...");
    setCurrentView('voice');
    try {
      const result = await analyzeVocalResonance(base64Audio);
      setVocalResult(result);
      addLog("Acoustic Analysis: Complete");
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleVouch = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'social_feed', postId);
    const post = socialPosts.find(p => p.id === postId);
    if (!post) return;
    await updateDoc(postRef, { vouchCount: post.vouchCount + 1 })
      .catch(e => handleFirestoreError(e, 'update', `social_feed/${postId}`));
  };

  const handleCompare = () => {
    if (!comparingScans || comparingScans.length < 2) return;
    const scanA = recentScans.find(s => s.id === comparingScans[0]);
    const scanB = recentScans.find(s => s.id === comparingScans[1]);
    if (!scanA || !scanB) return;

    const delta = scanA.scores.overall - scanB.scores.overall;
    setComparisonResult({
      deltaScore: Math.abs(delta),
      improvements: [
        delta > 0 ? "Regression detected in discipline" : "Definite refinement in jawline density",
        "Higher consistency in grooming protocol"
      ],
      analysis: `Comparison between ${new Date(scanA.timestamp).toLocaleDateString()} and ${new Date(scanB.timestamp).toLocaleDateString()} reveals a ${Math.abs(delta).toFixed(1)} point shift in your Elite Aesthetic Quotient.`
    });
    setCurrentView('evolution');
  };

  const downloadFlexCard = async () => {
    if (flexCardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(flexCardRef.current, { cacheBust: true, pixelRatio: 3 });
      download(dataUrl, `maximus-flex-${user?.displayName || 'user'}.png`);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Maximus Aesthetic Score',
          text: `I just scored a ${profile?.overallScore} on Maximus AI! Track your facial potential with me.`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      alert('Sharing not supported on this browser. Downloading Flex Card instead.');
      downloadFlexCard();
    }
  };

  const handlePostToSocial = async () => {
    if (!user || !scanResult) return;
    try {
      await addDoc(collection(db, 'social_feed'), {
        userId: user.uid,
        displayName: profile?.displayName || 'Anonymous Candidate',
        avatarUrl: profile?.avatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${user.uid}`,
        imageUrl: '', 
        score: scanResult.scores.overall,
        tier: getTier(scanResult.scores.overall).name,
        vouchCount: 0,
        timestamp: new Date().toISOString()
      }).catch(e => handleFirestoreError(e, 'create', 'social_feed'));
      alert('Broadcasted to the Shadow Protocol.');
      setCurrentView('social');
    } catch (err) {
      console.error(err);
    }
  };

  const startFaceYogaGuide = async (guide: any) => {
    setActiveGuide(guide);
    // Request camera for the overlay
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        alert("Camera access is required for AR tracking.");
      }
      setActiveGuide(null);
    }
  };

  const stopFaceYogaGuide = useCallback(() => {
    setActiveGuide(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleScan = async () => {
    console.log("handleScan triggered", { videoRef: !!videoRef.current, canvasRef: !!canvasRef.current, user: !!user });
    if (!videoRef.current) { alert("Video stream not ready"); return; }
    if (!canvasRef.current) { alert("Canvas not ready"); return; }
    if (!user) { alert("You must be logged in to scan"); return; }
    
    setScanning(true);
    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) {
        alert("Canvas context missing");
        setScanning(false);
        return;
      }
      
      console.log("Drawing image from video to canvas", videoRef.current.videoWidth, videoRef.current.videoHeight);
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
      console.log("Captured image length:", base64Image.length);
      addLog("Maximus AI: Processing Biometrics...");
      const result = await analyzeFacialFeatures(base64Image);
      
      setScanResult(result);
      addLog("Elite Status: Optimized");
      
      // Save scan to Firestore
      const scanData = {
        userId: user.uid,
        photoUrl: '', // In a real app, upload to storage first
        timestamp: new Date().toISOString(),
        scores: result.scores || { symmetry: 0, jawline: 0, skin: 0, eyes: 0, overall: 0 },
        scoreExplanations: result.scoreExplanations || { symmetry: "N/A", jawline: "N/A", skin: "N/A", eyes: "N/A" },
        feedback: result.feedback || "No feedback generated.",
        recommendations: result.recommendations || [],
        improvementPlan: result.improvementPlan || { daily: [], weekly: [], lifestyle: [], groomingAdvice: "N/A" },
        dailyInsight: result.dailyInsight || "Consistency is key.",
        recommendedIngredients: result.recommendedIngredients || []
      };
      
      await addDoc(collection(db, 'users', user.uid, 'scans'), scanData).catch(e => handleFirestoreError(e, 'create', `users/${user.uid}/scans`));

      // Update user overall score & Aura & Streak
      const today = new Date().toISOString().split('T')[0];
      const lastScan = profile?.lastScanDate?.split('T')[0];
      let newStreak = profile?.streak || 0;
      
      if (lastScan !== today) {
        if (lastScan === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
           newStreak += 1;
        } else {
           newStreak = 1;
        }
      }

      const newAura = (profile?.aura || 0) + 10;
      const updates: any = {
        overallScore: Math.max(result.scores.overall, profile?.overallScore || 0),
        aura: newAura,
        streak: newStreak,
        lastScanDate: today
      };
      
      // Check for achievements
      const newAchievements = [...(profile?.achievements || [])];
      if (result.scores.overall >= 90 && !newAchievements.find(a => a.id === '90-club')) {
        newAchievements.push({ id: '90-club', title: 'Adonis Tier', icon: '🔱', unlockedAt: new Date().toISOString() });
      }
      updates.achievements = newAchievements;

      await updateDoc(doc(db, 'users', user.uid), {
        ...updates
      }).catch(e => handleFirestoreError(e, 'update', `users/${user.uid}`));
      setProfile(prev => prev ? { ...prev, ...updates } : null);

    } catch (err) {
      console.error("Scan failed", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    
    // Sync to Firestore
    try {
      const routinesCol = collection(db, 'users', user.uid, 'routines');
      const q = query(routinesCol, limit(1));
      const querySnap = await getDoc(doc(db, 'users', user.uid, 'routines', 'daily')).catch(() => null);
      
      // We don't know the exact ID if we didn't use 'daily' before, but let's try 'daily'
      // If we find it, update it.
      await updateDoc(doc(db, 'users', user.uid, 'routines', 'daily'), {
        tasks: newTasks
      }).catch(async (e) => {
        // Fallback: update the first routine doc found
        const snapshot = await getDoc(doc(db, 'users', user.uid, 'routines', 'daily')); // This is redundant but just in case
        handleFirestoreError(e, 'update', `users/${user.uid}/routines/daily`);
      });
    } catch (e) {
      console.error("Task sync failed", e);
    }
  };

  const startCamera = async () => {
    setCurrentView('scan');
    setScanResult(null);
    try {
      // Only request video here for Face Analyzer logic
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      // Wait for React to render the videoRef inside the 'scan' view
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access denied or error:", err);
      setCurrentView('dashboard');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
         alert("Permission Denied: Please allow Camera access in your browser or device settings.");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCurrentView('dashboard');
  };

  const chartData = [...recentScans].reverse().map(scan => ({
    date: new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: scan.scores.overall
  }));

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-ios-bg">
        <Loader2 className="animate-spin text-ios-blue" size={40} />
      </div>
    );
  }

  const BackButton = () => (
    <button 
      onClick={() => setCurrentView('dashboard')}
      className="absolute top-4 left-4 w-12 h-12 rounded-full bg-ios-card flex items-center justify-center shadow-md border border-black/5 active:scale-90 z-20 transition-transform"
      aria-label="Go back"
    >
      <ChevronLeft size={24} />
    </button>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center p-8 text-center leading-normal">
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-ios-blue rounded-3xl flex items-center justify-center shadow-xl shadow-ios-blue/20 rotate-12">
            <Zap className="text-white fill-white" size={48} />
          </div>
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -top-2 -right-2 w-10 h-10 bg-ios-green rounded-xl flex items-center justify-center shadow-lg transform -rotate-12"
          >
            <Sparkles className="text-white" size={20} />
          </motion.div>
        </div>
        
        <h1 className="text-5xl font-black tracking-tight mb-4">Maximus</h1>
        <p className="text-ios-secondary-label text-lg mb-12 max-w-xs">
          The flagship facial analyzer for your ultimate version.
        </p>

        <button 
          onClick={loginWithGoogle}
          className="ios-btn-primary w-full max-w-xs flex items-center justify-center gap-3 py-4 shadow-lg shadow-ios-blue/30"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert" alt="Google" />
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-16 bg-ios-bg text-ios-label relative overflow-hidden">
      {showEliteModal && <ElitePaywallModal onClose={() => setShowEliteModal(false)} onUpgrade={() => {
         if (profile) setProfile({ ...profile, isElite: true });
      }} />}
      
      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-40 bg-ios-bg/80 backdrop-blur-md border-b border-black/[0.03]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-[0.15em] umax-gradient-text">MAXIMUS</h1>
          {isOffline && (
            <div className="flex items-center gap-1 bg-ios-orange/10 px-2 py-0.5 rounded-full border border-ios-orange/10 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-ios-orange" />
              <span className="text-[8px] font-black uppercase text-ios-orange">Offline</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-ios-card flex items-center justify-center border border-black/5 active:scale-95 transition-transform"
          >
            {theme === 'lunar' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={() => setIsMoreMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-ios-card flex items-center justify-center border border-black/5 active:scale-95 transition-transform"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* MORE MENU OVERLAY */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md flex justify-end"
            onClick={() => setIsMoreMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-72 h-full bg-ios-card shadow-2xl p-6 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
               <h2 className="text-sm font-black uppercase tracking-widest text-ios-secondary-label">Elite Protocols</h2>
               <button onClick={() => setIsMoreMenuOpen(false)}><X size={20} /></button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {[
                  { id: 'evolution', label: 'Evolution Matrix', icon: Layers, color: 'text-ios-blue' },
                  { id: 'simulator', label: 'Aesthetic Sim', icon: Scissors, color: 'text-indigo-500' },
                  { id: 'nutrition', label: 'Nutrition/Bloat', icon: Utensils, color: 'text-ios-orange' },
                  { id: 'voice', label: 'Vocal resonance', icon: Mic, color: 'text-ios-red' },
                  { id: 'posture', label: 'Structural post', icon: Activity, color: 'text-ios-green' },
                  { id: 'guides', label: 'AR Guides', icon: Camera, color: 'text-purple-500' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors text-left"
                  >
                    <item.icon className={item.color} size={20} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-black/5">
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-bold text-sm">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <AnimatePresence mode="popLayout">
          {/* DASHBOARD (SCANNER HOME) */}
        {currentView === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="p-6 md:p-10 max-w-2xl mx-auto"
          >
            <div className="text-center mb-10 mt-2 px-2">
              <p className="label-cap mb-2 umax-gradient-text uppercase tracking-[0.4em]">Elite Protocol</p>
              <h1 className="text-3xl font-black mb-3 tracking-tighter leading-tight">Maximize Your Potential</h1>
              <p className="text-ios-secondary-label text-sm font-medium leading-relaxed max-w-xs mx-auto">Upload or capture your profile to start your aesthetic optimization.</p>
            </div>

            {/* PEAK SYSTEM STATUS */}
            <div className="umax-card bg-black/[0.02] border-black/5 p-4 mb-8">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-ios-red' : 'bg-ios-green'} animate-pulse`} />
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">System Core: {isOffline ? 'Offline' : 'Elite'}</p>
                  </div>
                  <Clock size={10} className="opacity-40" />
               </div>
               <div className="space-y-1 h-3 overflow-hidden">
                 {logs.length > 0 ? (
                   <p className="text-[9px] font-bold text-ios-secondary-label truncate">{">>> "}{logs[logs.length-1].msg}</p>
                 ) : (
                   <p className="text-[9px] font-bold text-ios-secondary-label opacity-30">Telemetry active...</p>
                 )}
               </div>
            </div>

            <div className="umax-card mb-8 p-12 flex flex-col items-center justify-center text-center gap-10 bg-linear-to-br from-ios-blue/[0.03] to-ios-teal/[0.03] border-dashed border-2 border-ios-blue/10 rounded-[48px]">
              <div className="w-32 h-32 rounded-full bg-ios-blue/5 flex items-center justify-center relative shadow-2xl shadow-ios-blue/20">
                <div className="absolute inset-0 bg-ios-blue/10 rounded-full animate-pulse-slow opacity-20" />
                <Scan size={64} className="text-ios-blue" strokeWidth={1.5} />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-2xl font-black tracking-tighter">New Scan</h3>
                <p className="text-[9px] text-ios-secondary-label font-black uppercase tracking-[0.25em]">Biometric Face Mapping</p>
              </div>
              <button 
                onClick={startCamera}
                className="umax-btn-scan mt-2 w-full max-w-[200px]"
              >
                Capture
              </button>
            </div>

            {profile?.overallScore && profile.overallScore > 0 ? (
              <div className="umax-card bg-ios-card shadow-2xl p-8 relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-ios-blue/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="bg-ios-blue/10 text-ios-blue px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active Ranking</span>
                  <Award size={24} className="text-ios-blue/50" />
                </div>
                <div className="flex items-baseline gap-2 mb-2 relative z-10">
                  <span className="text-6xl font-black tracking-tighter leading-none umax-gradient-text">{profile.overallScore}</span>
                  <span className="text-ios-secondary-label font-mono text-lg">/100</span>
                </div>
                <p className="text-ios-secondary-label text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                  Tier: <span className={getTier(profile.overallScore).color}>{getTier(profile.overallScore).name}</span>
                </p>
              </div>
            ) : (
              <div className="umax-card bg-ios-orange/5 border-ios-orange/10 flex items-center gap-6 p-8">
                 <div className="w-14 h-14 rounded-2xl bg-ios-orange/10 flex items-center justify-center shrink-0">
                    <History className="text-ios-orange" size={28} />
                 </div>
                 <div>
                    <p className="font-black text-lg">Identity Needed</p>
                    <p className="text-xs text-ios-secondary-label font-medium opacity-80">Perform your first scan to unlock your elite ranking matrix.</p>
                 </div>
              </div>
            )}
          </motion.div>
        )}
        {/* SCAN VIEW */}
        {currentView === 'scan' && (
          <motion.div 
            key="scan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-50 bg-black text-white flex flex-col"
          >
            <header className="p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
              <button onClick={stopCamera} className="text-white/80 font-medium">Cancel</button>
              <h1 className="font-bold text-lg">Face Analyzer</h1>
              <div className="w-10" />
            </header>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover grayscale-[0.2]"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay guides */}
              <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/30 rounded-[4rem] relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-ios-blue rounded-full" />
                   
                   {/* Golden Ratio Guide */}
                   <div className="absolute inset-0 golden-ratio-guide overflow-hidden">
                      {/* Vertical lines */}
                      <div className="absolute bg-ios-blue/20 w-px h-full left-[33%] opacity-25" />
                      <div className="absolute bg-ios-blue/20 w-px h-full left-[66%] opacity-25" />
                      {/* Horizontal lines */}
                      <div className="absolute bg-ios-blue/20 h-px w-full top-[30%] opacity-25" />
                      <div className="absolute bg-ios-blue/20 h-px w-full top-[50%] opacity-25" />
                      <div className="absolute bg-ios-blue/20 h-px w-full top-[70%] opacity-25" />
                   </div>
                </div>
              </div>

              {scanning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50">
                  <div className="mb-8 relative">
                    <Loader2 className="animate-spin text-ios-blue" size={80} />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
                  </div>
                  <h2 className="text-3xl font-black mb-2 animate-pulse">Maximus AI analyzing...</h2>
                  <p className="text-white/60 text-center max-w-xs uppercase tracking-widest text-[10px] font-bold">Checking Symmetry | Scaling Jawline | Evaluating Skin</p>
                </div>
              )}

              {scanResult && !scanning && (
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  className="absolute inset-0 bg-ios-bg text-black z-50 overflow-y-auto"
                >
                  <div className="p-6 pt-12 pb-32 max-w-2xl mx-auto">
                     <div className="flex justify-between items-start mb-8">
                       <div>
                         <p className="text-ios-blue font-bold uppercase tracking-widest text-[10px] mb-2">Analysis Complete</p>
                         <h2 className="text-5xl font-black mb-2">{scanResult.scores.overall}</h2>
                         <p className="text-ios-secondary-label font-bold">Maximus Peak Score</p>
                       </div>
                       <button onClick={() => { setScanResult(null); startCamera(); }} className="ios-btn-secondary p-3">
                         <RefreshCw size={20} />
                       </button>
                     </div>

                     {/* TABS MENU */}
                     <div className="flex bg-gray-200/50 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar">
                       {[
                         { id: 'overview', label: 'Scores' },
                         { id: 'analysis', label: 'Analysis' },
                         { id: 'plan', label: 'Action Plan' },
                         { id: 'flex', label: 'Flex Card' }
                       ].map(tab => (
                         <button
                           key={tab.id}
                           onClick={() => setScanTab(tab.id as any)}
                           className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${scanTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-ios-secondary-label hover:text-black'}`}
                         >
                           {tab.label}
                         </button>
                       ))}
                     </div>

                     {scanTab === 'overview' && (
                       <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                          { label: 'Symmetry', val: scanResult.scores.symmetry, key: 'symmetry' },
                          { label: 'Jawline', val: scanResult.scores.jawline, key: 'jawline' },
                          { label: 'Skin', val: scanResult.scores.skin, key: 'skin' },
                          { label: 'Eyes', val: scanResult.scores.eyes, key: 'eyes' }
                        ].map(stat => (
                          <div 
                            key={stat.label} 
                            className={`ios-card bg-white p-5 transition-all cursor-pointer ${expandedScore === stat.key ? 'col-span-2' : ''}`}
                            onClick={() => setExpandedScore(expandedScore === stat.key ? null : stat.key)}
                          >
                             <div className="flex justify-between items-center mb-1">
                               <p className="text-[10px] font-black text-ios-secondary-label uppercase tracking-widest">{stat.label}</p>
                               <Sparkles size={12} className={expandedScore === stat.key ? 'text-ios-blue' : 'text-gray-300'} />
                             </div>
                             <p className="text-3xl font-black">{stat.val}</p>
                             
                             <AnimatePresence>
                               {expandedScore === stat.key && (
                                 <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="overflow-hidden"
                                 >
                                   <div className="pt-4 border-t border-gray-100 mt-4">
                                      <p className="text-xs font-bold leading-relaxed text-ios-secondary-label">
                                        {scanResult.scoreExplanations[stat.key as keyof typeof scanResult.scoreExplanations]}
                                      </p>
                                   </div>
                                 </motion.div>
                               )}
                             </AnimatePresence>

                             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stat.val}%` }}
                                  className="h-full bg-ios-blue rounded-full"
                                />
                             </div>
                              {!expandedScore && <p className="text-[9px] font-bold text-ios-secondary-label mt-2 italic">Tap to see why</p>}
                           </div>
                         ))}
                       </div>
                     )}

                     {scanTab === 'analysis' && (
                       <div className="ios-card bg-[#1C1C1E] text-white p-6 mb-8 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4">
                           <button 
                             onClick={() => speakFeedback(scanResult.feedback)}
                             className={`p-2 rounded-full ${isSpeaking ? 'bg-ios-blue animate-pulse' : 'bg-white/10'}`}
                           >
                             <Zap size={16} />
                           </button>
                         </div>
                         <h3 className="label-cap text-white/40 mb-4 flex items-center gap-2">
                           <Sparkles className="text-ios-blue" size={20} /> Maximus AI Analysis
                         </h3>
                         <div className="text-sm font-medium leading-relaxed mb-4">
                           <MarkDown>{scanResult.feedback}</MarkDown>
                         </div>
                         <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                           <span className="label-cap text-white/40">Status:</span>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${getTier(scanResult.scores.overall).color}`}>
                             {getTier(scanResult.scores.overall).name}
                           </span>
                         </div>
                       </div>
                     )}

                     {scanTab === 'flex' && (
                       <div className="mb-12 flex flex-col items-center">
                         <h3 className="text-2xl font-black mb-6 w-full px-2">The Flex Card</h3>
                        <div className="relative group">
                          {/* THE DOWNLOADABLE CARD */}
                          <div ref={flexCardRef} className="flex-card scale-90 md:scale-100 origin-center">
                            <div className="flex-card-bg" />
                            <div className="relative z-10 h-full flex flex-col">
                              <div className="flex justify-between items-center mb-12">
                                <div className="w-12 h-12 bg-ios-blue rounded-2xl flex items-center justify-center shadow-lg">
                                  <Zap className="text-white" size={24} fill="white" />
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Maximus ID</p>
                                  <p className="text-xs font-bold text-ios-blue">#{user.uid.substring(0, 8).toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="mb-auto">
                                <div className="mb-2">
                                  <p className="text-4xl font-black tracking-tighter">{user.displayName}</p>
                                  <p className={`text-xs font-black uppercase tracking-widest ${getTier(scanResult.scores.overall).color}`}>
                                    {getTier(scanResult.scores.overall).name}
                                  </p>
                                </div>
                                
                                <div className="mt-12 flex justify-between items-end">
                                  <div>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 leading-none">
                                        {scanResult.scores.overall}
                                      </span>
                                      <span className="text-white/20 text-2xl font-bold font-mono leading-none">/100</span>
                                    </div>
                                    <p className="label-cap text-white/40 mt-2">Elite Aesthetic Quotient (EAQ)</p>
                                  </div>
                                  <div className="pb-2 text-right">
                                     <p className="text-[8px] font-black uppercase text-ios-blue mb-1">Global Standing</p>
                                     <p className="text-xl font-black">Top {100 - scanResult.scores.overall}%</p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-8 pb-4 border-t border-white/10 pt-6">
                                <div>
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Symmetry</p>
                                  <p className="text-xl font-bold">{scanResult.scores.symmetry}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Jawline</p>
                                  <p className="text-xl font-bold">{scanResult.scores.jawline}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Skin</p>
                                  <p className="text-xl font-bold">{scanResult.scores.skin}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Eyes</p>
                                  <p className="text-xl font-bold">{scanResult.scores.eyes}</p>
                                </div>
                              </div>

                              <div className="mt-auto text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Official Peak Potential Verification</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                          <button 
                            onClick={downloadFlexCard}
                            className="flex-1 ios-btn-secondary flex items-center justify-center gap-2"
                          >
                            <Download size={20} /> Download
                          </button>
                          <button 
                            onClick={handleShare}
                            className="flex-1 ios-btn-primary flex items-center justify-center gap-2"
                          >
                            <Share2 size={20} /> Share
                          </button>
                        </div>
                        <button 
                          onClick={handlePostToSocial}
                          className="w-full max-w-sm mt-3 bento-card flex-row items-center justify-center gap-2 py-4 bg-teal-500/10 text-teal-600 border-teal-500/20"
                        >
                          <Globe size={20} /> Broadcast to Shadow Feed
                        </button>
                         <p className="text-ios-secondary-label text-[10px] font-bold mt-4 uppercase tracking-widest text-center">Share with your circle to assert dominance</p>
                       </div>
                     )}

                     {scanTab === 'plan' && (
                       <div className="mb-12">
                         <h3 className="text-2xl font-black mb-8 px-2">Elite Personalised Plan</h3>
                        
                        <div className="bento-grid !p-0 mb-8">
                          <div className="bento-wide bg-white">
                             <p className="label-cap text-ios-blue">Grooming Blueprint</p>
                             <p className="text-sm font-bold mt-2">{scanResult.improvementPlan?.groomingAdvice}</p>
                          </div>
                          <div className="bento-tall bg-white">
                             <p className="label-cap">Daily Protocol</p>
                             <div className="space-y-3 mt-4">
                               {scanResult.improvementPlan?.daily?.map((item: string, i: number) => (
                                 <div key={i} className="flex gap-2 items-start">
                                   <div className="w-1 h-1 rounded-full bg-ios-blue mt-1.5 shrink-0" />
                                   <p className="text-[10px] font-bold leading-tight">{item}</p>
                                 </div>
                               ))}
                             </div>
                          </div>
                          <div className="bento-tall bg-white">
                             <p className="label-cap">Weekly Regimen</p>
                             <div className="space-y-3 mt-4">
                               {scanResult.improvementPlan?.weekly?.map((item: string, i: number) => (
                                 <div key={i} className="flex gap-2 items-start">
                                   <div className="w-1 h-1 rounded-full bg-ios-green mt-1.5 shrink-0" />
                                   <p className="text-[10px] font-bold leading-tight">{item}</p>
                                 </div>
                               ))}
                             </div>
                          </div>
                          <div className="bento-wide bg-white">
                             <p className="label-cap">Maximus Lifestyle</p>
                             <div className="grid grid-cols-2 gap-4 mt-2">
                               {scanResult.improvementPlan?.lifestyle?.map((item: string, i: number) => (
                                 <div key={i} className="bg-ios-bg p-3 rounded-xl">
                                   <p className="text-[10px] font-black">{item}</p>
                                 </div>
                               ))}
                             </div>
                          </div>
                        </div>

                        <h3 className="font-black text-xl mb-6">Flagship Recommendations</h3>
                        <div className="space-y-4 mb-12">
                          {scanResult.recommendations?.map((rec: string, i: number) => (
                            <div key={i} className="ios-card flex items-start gap-4">
                               <div className="w-8 h-8 rounded-full bg-ios-blue/10 flex items-center justify-center shrink-0 text-ios-blue font-bold text-xs">
                                 {i + 1}
                               </div>
                               <p className="font-medium">{rec}</p>
                            </div>
                          ))}
                        </div>

                        {/* PRODUCT MATCHES */}
                        <div className="mb-12">
                           <h3 className="text-2xl font-black mb-6 px-2">Scientific Arsenal</h3>
                           <p className="text-xs font-medium text-ios-secondary-label px-2 mb-6">Targeted active compounds recommended for your profile.</p>
                           <div className="grid grid-cols-2 gap-4">
                              {scanResult.recommendedIngredients?.map((ing: string, i: number) => (
                                <div key={i} className="bento-card border-ios-blue/20 bg-ios-blue/5">
                                   <div className="w-8 h-8 bg-ios-blue rounded-lg mb-4 flex items-center justify-center">
                                      <Sparkles size={16} className="text-white" />
                                   </div>
                                   <p className="text-sm font-black uppercase tracking-tighter">{ing}</p>
                                   <p className="text-[10px] text-ios-secondary-label mt-2">Active Ingredient</p>
                                </div>
                              ))}
                             </div>
                          </div>

                          {/* SUPPLEMENT STACK GENERATOR */}
                          <div className="mb-12">
                             <div className="glass-panel p-6 bg-gradient-to-br from-ios-green/10 to-transparent border-ios-green/30">
                                <p className="label-cap text-ios-green mb-2">Internal Health</p>
                                <h3 className="text-xl font-black mb-4">Custom Supplement Stack</h3>
                                <p className="text-xs text-ios-secondary-label mb-6">Formulated based on your facial edema, skin clarity, and posture deficits.</p>
                                <div className="space-y-3">
                                   {/* Mock generated supplements */}
                                   <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-white/20">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-ios-green text-white flex items-center justify-center font-bold text-lg">Z</div>
                                         <div>
                                            <p className="font-bold text-sm">Zinc Picolinate 50mg</p>
                                            <p className="text-[10px] text-ios-secondary-label uppercase">Skin Clearing • Jawline Definition</p>
                                         </div>
                                      </div>
                                      <button onClick={() => setShowEliteModal(true)} className="ios-btn-secondary !py-2 !px-4 text-[10px] font-black uppercase text-ios-green flex items-center gap-1">Get <Zap size={10} /></button>
                                   </div>
                                   <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-white/20">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-ios-blue text-white flex items-center justify-center font-bold text-lg">B</div>
                                         <div>
                                            <p className="font-bold text-sm">Biotin 10,000mcg</p>
                                            <p className="text-[10px] text-ios-secondary-label uppercase">Hair Density • Arch Thickness</p>
                                         </div>
                                      </div>
                                      <button onClick={() => setShowEliteModal(true)} className="ios-btn-secondary !py-2 !px-4 text-[10px] font-black uppercase text-ios-blue flex items-center gap-1">Get <Zap size={10} /></button>
                                   </div>
                                   <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-white/20">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-ios-orange text-white flex items-center justify-center font-bold text-lg">K</div>
                                         <div>
                                            <p className="font-bold text-sm">Vitamin K2 + D3</p>
                                            <p className="text-[10px] text-ios-secondary-label uppercase">Bone Growth • Facial Structure</p>
                                         </div>
                                      </div>
                                      <button onClick={() => setShowEliteModal(true)} className="ios-btn-secondary !py-2 !px-4 text-[10px] font-black uppercase text-ios-orange flex items-center gap-1">Get <Zap size={10} /></button>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* INTERACTIVE FACE REPRESENTATION */}
                        <div className="mb-12 flex flex-col items-center">
                           <h3 className="text-2xl font-black mb-6 w-full px-2">Anatomical Focus</h3>
                           <div className="w-64 h-80 bg-ios-card rounded-[60px] relative overflow-hidden flex items-center justify-center shadow-xl">
                              {/* CSS Face Model */}
                              <div className="w-40 h-52 border-4 border-ios-blue/30 rounded-full relative">
                                 {/* Eyes areas */}
                                 <div className={`absolute top-14 left-4 w-10 h-8 rounded-full border-2 ${scanResult.scores.eyes > 80 ? 'border-ios-green bg-ios-green/10' : 'border-ios-orange bg-ios-orange/10'} border-dashed`} />
                                 <div className={`absolute top-14 right-4 w-10 h-8 rounded-full border-2 ${scanResult.scores.eyes > 80 ? 'border-ios-green bg-ios-green/10' : 'border-ios-orange bg-ios-orange/10'} border-dashed`} />
                                 {/* Jawline area */}
                                 <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-24 rounded-b-[80px] border-b-4 ${scanResult.scores.jawline > 80 ? 'border-ios-green' : 'border-ios-orange'} opacity-50`} />
                                 {/* Symmetry center line */}
                                 <div className="absolute top-0 bottom-0 left-1/2 w-px bg-ios-blue/20" />
                              </div>
                              <div className="absolute bottom-6 px-4 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                 Surface Heatmap Active
                              </div>
                           </div>
                           <p className="text-ios-secondary-label text-[10px] font-bold mt-4 uppercase tracking-widest">Visualizing areas for corrective focus</p>
                        </div>
                      </div>
                     )}

                  </div>
                  
                  <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ios-bg to-transparent">
                    <button onClick={stopCamera} className="ios-btn-primary w-full shadow-lg">Done</button>
                  </div>
                </motion.div>
              )}
            </div>

            {!scanResult && !scanning && (
              <footer className="p-8 pb-12 flex flex-col items-center gap-6 bg-gradient-to-t from-black to-transparent">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Center your face in the guide</p>
                <button 
                  onClick={handleScan}
                  className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-full shadow-inner" />
                </button>
              </footer>
            )}
          </motion.div>
        )}

        {/* ARSENAL VIEW */}
        {currentView === 'arsenal' && (
          <motion.div 
            key="arsenal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 md:p-8 max-w-2xl mx-auto pb-32"
          >
             <header className="mb-10 px-2 pt-8 text-center">
                <p className="label-cap">Maximus Toolkit</p>
                <h1 className="text-4xl font-black tracking-tight">The Arsenal</h1>
                <p className="text-ios-secondary-label text-xs mt-2 font-medium">Specialized modules to systematically ascend.</p>
             </header>

             <div className="grid gap-4 mt-6">
                 {/* Face Coach */}
                 <button onClick={() => setCurrentView('guides')} className="glass-panel p-6 flex items-center justify-between group text-left">
                    <div className="flex flex-row items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-ios-teal/10 flex items-center justify-center border border-ios-teal/20 group-active:scale-95 transition-transform">
                          <Brain className="text-ios-teal" size={24} />
                       </div>
                       <div>
                          <p className="font-black text-lg">AR Face Coach</p>
                          <p className="text-xs text-ios-secondary-label mt-1">Interactive 3D massage guides.</p>
                       </div>
                    </div>
                    <ChevronRight className="text-ios-secondary-label opacity-50" />
                 </button>

                 {/* Posture & Mewing */}
                 <button onClick={() => setCurrentView('posture')} className="glass-panel p-6 flex items-center justify-between group text-left">
                    <div className="flex flex-row items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-ios-blue/10 flex items-center justify-center border border-ios-blue/20 group-active:scale-95 transition-transform">
                          <Activity className="text-ios-blue" size={24} />
                       </div>
                       <div>
                          <p className="font-black text-lg">Posture & Mewing</p>
                          <p className="text-xs text-ios-secondary-label mt-1">Calibrate head tilt & focus timer.</p>
                       </div>
                    </div>
                    <ChevronRight className="text-ios-secondary-label opacity-50" />
                 </button>

                 {/* Nutrition / De-bloat */}
                 <button onClick={() => setCurrentView('nutrition')} className="glass-panel p-6 flex items-center justify-between group text-left">
                    <div className="flex flex-row items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-ios-orange/10 flex items-center justify-center border border-ios-orange/20 group-active:scale-95 transition-transform">
                          <Utensils className="text-ios-orange" size={24} />
                       </div>
                       <div>
                          <p className="font-black text-lg">De-Bloat Tracker</p>
                          <p className="text-xs text-ios-secondary-label mt-1">Scan meals for retention risks.</p>
                       </div>
                    </div>
                    <ChevronRight className="text-ios-secondary-label opacity-50" />
                 </button>

                 {/* Aesthetic Simulator */}
                 <button onClick={() => setCurrentView('simulator')} className="glass-panel p-6 flex items-center justify-between group text-left">
                    <div className="flex flex-row items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-active:scale-95 transition-transform">
                          <Scissors className="text-indigo-500" size={24} />
                       </div>
                       <div>
                          <p className="font-black text-lg">Style Simulator</p>
                          <p className="text-xs text-ios-secondary-label mt-1">AI-driven haircuts and grooming.</p>
                       </div>
                    </div>
                    <ChevronRight className="text-ios-secondary-label opacity-50" />
                 </button>

                 {/* Voice Analysis */}
                 <button onClick={() => setCurrentView('voice')} className="glass-panel p-6 flex items-center justify-between group text-left">
                    <div className="flex flex-row items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-ios-red/10 flex items-center justify-center border border-ios-red/20 group-active:scale-95 transition-transform">
                          <Mic className="text-ios-red" size={24} />
                       </div>
                       <div>
                          <p className="font-black text-lg">Voice Resonance</p>
                          <p className="text-xs text-ios-secondary-label mt-1">Pitch and aura detection.</p>
                       </div>
                    </div>
                    <ChevronRight className="text-ios-secondary-label opacity-50" />
                 </button>
             </div>
          </motion.div>
        )}

        {/* ROUTINES VIEW */}
        {currentView === 'routines' && (
          <motion.div 
            key="routines"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 md:p-8 max-w-2xl mx-auto pb-32"
          >
             <header className="mb-10 px-2">
                <p className="label-cap">Personal Protocols</p>
                <h1 className="text-4xl font-black tracking-tight">Daily Routine</h1>
             </header>

             <div className="space-y-4">
                {tasks.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full bento-card flex items-center justify-between p-6 ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-ios-blue border-ios-blue' : 'border-gray-300'}`}>
                        {task.completed && <CheckSquare className="text-white" size={16} />}
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
                        <p className="label-cap">{task.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
             </div>

             <div className="mt-8 bento-card bg-ios-blue/5 border-ios-blue/10 flex items-center gap-4 py-8">
                <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center shrink-0">
                  <Zap className="text-ios-blue" size={24} />
                </div>
                <div>
                   <p className="font-bold">Next Milestone</p>
                   <p className="text-sm text-ios-secondary-label">Complete 3 more days for a 7-day Maximus streak.</p>
                </div>
             </div>
          </motion.div>
        )}

        {/* PROFILE VIEW */}
        {currentView === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 md:p-8 max-w-2xl mx-auto pb-32"
          >
             <header className="mb-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl mb-6 ring-4 ring-white">
                   <img src={profile?.avatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${user.uid}&backgroundColor=f0f4f8`} alt="Profile" />
                </div>
                <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-2">
                   {profile?.displayName}
                   {profile?.isElite && (
                     <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-md shadow-lg shadow-amber-500/30">ELITE</span>
                   )}
                </h1>
                <p className="text-ios-secondary-label font-medium mb-4">{profile?.email}</p>
                
                <div className="flex gap-2 mb-8">
                  <div className="bg-ios-blue px-4 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-md">
                    ID: MAX-{user.uid.slice(0, 6)}
                  </div>
                  <div className="bg-ios-green/10 px-4 py-1.5 rounded-full text-ios-green text-[9px] font-black uppercase tracking-widest">
                    Streak: {profile?.streak || 0} Days
                  </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <div className="umax-card bg-white p-6 flex flex-col items-center gap-2 border-black/5">
                    <p className="label-cap !mb-0 text-center text-[9px]">Aura Points</p>
                    <p className="text-3xl font-black umax-gradient-text">{profile?.aura || 0}</p>
                    <div className="flex items-center gap-1 opacity-50">
                      <TrendingUp size={12} className="text-ios-blue" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Rising</span>
                    </div>
                  </div>
                  <div className="umax-card bg-white p-6 flex flex-col items-center gap-2 border-black/5">
                    <p className="label-cap !mb-0 text-center text-[9px]">Peak Aura</p>
                    <p className="text-3xl font-black text-ios-orange">{Math.max(profile?.aura || 0, 1000)}</p>
                    <div className="flex items-center gap-1 opacity-50">
                     <Zap size={12} className="text-ios-orange fill-ios-orange" />
                     <span className="text-[10px] font-black uppercase tracking-tighter text-ios-orange">All-time</span>
                    </div>
                  </div>
                </div>

                <div className="w-full glass-panel p-6 shadow-none border-gray-100">
                   <div className="flex justify-between items-center mb-4">
                     <p className="label-cap !mb-0">Aura Level</p>
                     <span className="text-xs font-black text-ios-blue">Lv.{Math.floor((profile?.aura || 0) / 500) + 1}</span>
                   </div>
                   <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                      <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${((profile?.aura || 0) % 500) / 5}%` }}
                       className="h-full bg-ios-blue shadow-[0_0_12px_rgba(0,122,255,0.5)]"
                      />
                   </div>
                   <p className="text-[9px] font-bold text-ios-secondary-label mt-2 text-center uppercase tracking-widest">
                     {500 - ((profile?.aura || 0) % 500)} Points to Next Evolution
                   </p>
                </div>
             </header>

             <h2 className="text-xl font-black mb-4">Analytics Engine</h2>
             <div className="glass-panel p-6 mb-8 w-full border border-ios-blue/10">
                <p className="label-cap mb-6">Aesthetic Trajectory</p>
                <div className="h-48 w-full text-xs">
                   {/* Dummy historical data since we only currently have current scores */}
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={[
                        { name: 'W1', score: 65 },
                        { name: 'W2', score: 68 },
                        { name: 'W3', score: 71 },
                        { name: 'Curr', score: scanResult ? scanResult.scores.overall : 75 }
                     ]}>
                       <XAxis dataKey="name" stroke="var(--color-ios-secondary-label)" tick={{fill: 'var(--color-ios-secondary-label)'}} axisLine={false} tickLine={false} />
                       <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                       <Line type="monotone" dataKey="score" stroke="var(--color-ios-blue)" strokeWidth={4} dot={{ r: 4, fill: 'var(--color-ios-blue)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="space-y-4 mb-8">
                <div 
                   onClick={() => setShowEliteModal(true)}
                   className="glass-panel flex items-center justify-between py-4 px-6 active:scale-95 transition-transform cursor-pointer relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/20 blur-2xl rounded-full" />
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                         <Zap size={20} className="text-amber-500 fill-amber-500" />
                      </div>
                      <div>
                         <span className="font-bold flex items-center gap-2 mb-1">
                            Generative Timelapse 
                            <span className="bg-amber-100 text-amber-700 text-[8px] uppercase font-black px-2 py-0.5 rounded-full">PRO</span>
                         </span>
                         <span className="text-[10px] text-ios-secondary-label">AI aging & morphology predictions</span>
                      </div>
                   </div>
                   <ChevronRight size={20} className="text-ios-secondary-label relative z-10" />
                </div>
                <div className="bento-card flex-row items-center justify-between py-4">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                         <UserIcon size={20} />
                      </div>
                      <span className="font-bold">Account Settings</span>
                   </div>
                   <ChevronRight size={20} className="text-ios-secondary-label" />
                </div>
                <div className="bento-card flex-row items-center justify-between py-4">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                         <Award size={20} />
                      </div>
                      <span className="font-bold">Achievements</span>
                   </div>
                   <ChevronRight size={20} className="text-ios-secondary-label" />
                </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full bento-card flex-row items-center justify-between py-4 border-red-500/10 active:bg-red-50 text-red-500"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                         <LogOut size={20} />
                      </div>
                      <span className="font-bold">Log Out</span>
                   </div>
                   <ChevronRight size={20} />
                </button>
             </div>

             <div className="text-center opacity-30">
               <p className="label-cap mb-1">Maximus Flagship v1.0.4</p>
               <p className="text-[10px]">Built for Excellence.</p>
             </div>
          </motion.div>
        )}
        {/* ELITE PROTOCOL VIEWS */}
        
        {/* SHADOW SOCIAL FEED */}
        {currentView === 'social' && (
          <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Shadow Protocol</p>
              <h1 className="text-4xl font-black">Global Feed</h1>
              <p className="text-ios-secondary-label text-xs mt-2 font-medium italic">Anonymous elite results from the Maximus collective.</p>
            </header>

            {/* 1v1 BATTLES HERO */}
            <div className="glass-panel p-6 mb-8 bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative overflow-hidden border-indigo-500/30">
               <div className="relative z-10 text-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300 mb-2">Maximus Arena (Beta)</p>
                  <h2 className="text-2xl font-black mb-4">1v1 Aesthetics Challenge</h2>
                  <p className="text-xs text-indigo-200 mb-6 font-medium">Draft your best photo and battle peers globally. Winner takes their Aura points.</p>
                  <button className="ios-btn-primary bg-indigo-500 shadow-indigo-500/30 px-8 py-3 rounded-full uppercase tracking-widest text-[10px]">
                     Enter Arena Matchmaking
                  </button>
               </div>
               {/* Decorative background shapes */}
               <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="space-y-6">
              {socialPosts.map(post => (
                <div key={post.id} className="bento-card p-0 overflow-hidden bg-white shadow-xl">
                  <div className="aspect-video bg-ios-bg relative">
                    <img src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/450`} alt="Submission" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-2xl font-black">{post.score}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{post.tier}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-ios-bg border border-black/5">
                        <img src={post.avatarUrl} alt="Avatar" />
                      </div>
                      <p className="text-xs font-bold">{post.displayName}</p>
                    </div>
                    <button 
                      onClick={() => handleVouch(post.id)}
                      className="bg-ios-blue/10 text-ios-blue px-4 py-2 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
                    >
                      <Zap size={14} fill="currentColor" />
                      <span className="text-xs font-black uppercase tracking-widest">Vouch {post.vouchCount}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* POSTURE & MEWING PROTOCOL */}
        {currentView === 'posture' && (
          <motion.div key="posture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Structural Integrity</p>
              <h1 className="text-4xl font-black">Posture & Mewing</h1>
            </header>

            <MewingTimerBlock />

            <div className="bento-card border-dashed border-2 border-ios-blue/30 items-center justify-center py-12 mb-8 bg-ios-blue/5">
               <Activity className="text-ios-blue mb-4" size={48} />
               <h3 className="text-xl font-bold mb-2">Posture Calibration</h3>
               <p className="text-xs text-ios-secondary-label text-center mb-6 max-w-xs">Upload or take a profile-view photo to analyze head tilt and spine neutrality.</p>
               <div className="flex gap-4 w-full max-w-xs">
                 <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => handlePostureScan((ev.target?.result as string).split(',')[1]);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden" 
                  id="posture-upload" 
                />
                 <label htmlFor="posture-upload" className="flex-1 ios-btn-secondary flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={18} /> Upload
                 </label>

                 <input 
                  type="file" 
                  accept="image/*" 
                  capture="user"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => handlePostureScan((ev.target?.result as string).split(',')[1]);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden" 
                  id="posture-camera" 
                />
                 <label htmlFor="posture-camera" className="flex-1 ios-btn-primary flex items-center justify-center gap-2 cursor-pointer">
                    <Camera size={18} /> Camera
                 </label>
               </div>
            </div>

            {postureResult && (
              <div className="space-y-4">
                <div className="bento-grid !p-0">
                  <div className="bento-card items-center gap-1">
                    <p className="text-4xl font-black">{postureResult.scores?.headPosture ?? "N/A"}</p>
                    <p className="label-cap">Head</p>
                  </div>
                  <div className="bento-card items-center gap-1">
                    <p className="text-4xl font-black">{postureResult.scores?.spineNeutrality ?? "N/A"}</p>
                    <p className="label-cap">Spine</p>
                  </div>
                </div>
                <div className="bento-card bg-[#1C1C1E] text-white">
                  <p className="label-cap text-ios-blue mb-2">Alpha Corrective Advice</p>
                  <p className="text-sm font-bold leading-relaxed italic">"{postureResult.feedback}"</p>
                  <div className="mt-4 space-y-2">
                    {postureResult.remedies?.map((r, i) => (
                      <div key={i} className="flex gap-2 items-center text-xs font-medium text-white/70">
                        <Zap size={10} className="text-ios-orange fill-ios-orange" /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* NUTRITION & BLOAT VIEW */}
        {currentView === 'nutrition' && (
          <motion.div key="nutrition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Facial Edema Protocol</p>
              <h1 className="text-4xl font-black">De-Bloat Tracker</h1>
              <p className="text-ios-secondary-label text-xs mt-2 font-medium">Detect sodium and water retention from meal visuals.</p>
            </header>

            {!nutritionResult ? (
              <div className="bento-card border-dashed border-2 border-ios-orange/30 items-center justify-center py-20 bg-ios-orange/5">
                <Utensils className="text-ios-orange mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">Scan Your Meal</h3>
                <p className="text-xs text-ios-secondary-label text-center mb-6 max-w-xs">Upload or take a photo of your meal to detect bloat risk.</p>
                <div className="flex gap-4 w-full max-w-xs">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleNutritionScan((ev.target?.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                    id="meal-upload" 
                  />
                  <label htmlFor="meal-upload" className="flex-1 ios-btn-secondary flex items-center justify-center gap-2 cursor-pointer border-ios-orange/30 text-ios-orange">
                     <Upload size={18} /> Upload
                  </label>
                  
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleNutritionScan((ev.target?.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                    id="meal-camera" 
                  />
                  <label htmlFor="meal-camera" className="flex-1 ios-btn-primary bg-ios-orange flex items-center justify-center gap-2 cursor-pointer shadow-ios-orange/30">
                     <Camera size={18} /> Camera
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bento-card items-center justify-center py-8">
                  <div className={`p-6 rounded-full ${nutritionResult.bloatRisk === 'High' ? 'bg-ios-red/10 animate-pulse' : 'bg-ios-green/10'} mb-4`}>
                    <Activity size={32} className={nutritionResult.bloatRisk === 'High' ? 'text-ios-red' : 'text-ios-green'} />
                  </div>
                  <p className="label-cap">Bloat Risk Status</p>
                  <p className={`text-4xl font-black ${nutritionResult.bloatRisk === 'High' ? 'text-ios-red' : 'text-ios-green'}`}>{nutritionResult.bloatRisk} Risk</p>
                </div>
                <div className="bento-grid !p-0">
                  <div className="bento-card">
                    <p className="label-cap">Sodium Level</p>
                    <p className="font-bold">{nutritionResult.sodiumLevel}</p>
                  </div>
                  <div className="bento-card">
                    <p className="label-cap">Hydration</p>
                    <p className="font-bold">{nutritionResult.hydrationImpact}</p>
                  </div>
                </div>
                <div className="bento-card bg-ios-orange/5 border-ios-orange/10">
                  <p className="label-cap text-ios-orange mb-2">Blueprint Advice</p>
                  <p className="text-sm font-bold leading-relaxed">{nutritionResult.aestheticsAdvice}</p>
                </div>
                <button onClick={() => setNutritionResult(null)} className="w-full ios-btn-secondary">New Analysis</button>
              </div>
            )}
          </motion.div>
        )}

        {/* EVOLUTION MATRIX VIEW */}
        {currentView === 'evolution' && (
          <motion.div key="evolution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Optimization Delta</p>
              <h1 className="text-4xl font-black">Evolution Matrix</h1>
            </header>

            {!comparisonResult ? (
              <div className="space-y-6">
                <div className="bento-card">
                  <p className="label-cap mb-4">Select 2 Scans to Compare</p>
                  <div className="space-y-3">
                    {recentScans.map(scan => (
                      <button 
                        key={scan.id}
                        onClick={() => {
                          if (comparingScans?.includes(scan.id)) {
                            setComparingScans(prev => prev?.[0] === scan.id ? null : [prev![0], ''] as any);
                          } else if (!comparingScans) {
                            setComparingScans([scan.id, '']);
                          } else if (comparingScans[1] === '') {
                            setComparingScans([comparingScans[0], scan.id]);
                          }
                        }}
                        className={`w-full bento-card flex-row items-center justify-between py-3 border-2 transition-all ${comparingScans?.includes(scan.id) ? 'border-ios-blue bg-ios-blue/5' : 'border-transparent'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-ios-bg flex items-center justify-center text-xs font-black">{scan.scores.overall}</div>
                          <span className="text-sm font-bold">{new Date(scan.timestamp).toLocaleDateString()}</span>
                        </div>
                        {comparingScans?.includes(scan.id) && <Zap size={14} className="text-ios-blue fill-ios-blue" />}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={!comparingScans || comparingScans[1] === ''}
                    onClick={handleCompare}
                    className="w-full ios-btn-primary mt-6 disabled:bg-gray-200"
                  >
                    Generate Glow Up Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bento-hero overflow-hidden">
                   <div className="flex justify-between items-end h-full">
                      <div>
                        <p className="label-cap text-white/50">Delta Change</p>
                        <p className="text-7xl font-black">+{comparisonResult.deltaScore}</p>
                      </div>
                      <TrendingUp size={64} className="text-white/20 mb-2" />
                   </div>
                </div>
                <div className="bento-card">
                  <p className="label-cap text-ios-blue mb-4">Improvement Highlights</p>
                  <div className="space-y-3">
                    {comparisonResult.improvements.map((imp, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-6 h-6 rounded-full bg-ios-green/10 flex items-center justify-center">
                          <Sparkles size={12} className="text-ios-green" />
                        </div>
                        <p className="text-sm font-bold">{imp}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bento-card bg-[#1C1C1E] text-white">
                  <p className="text-sm font-medium italic opacity-80 leading-relaxed">"{comparisonResult.analysis}"</p>
                </div>
                <button onClick={() => setComparisonResult(null)} className="w-full ios-btn-secondary">New Selection</button>
              </div>
            )}
          </motion.div>
        )}

        {/* SIMULATOR VIEW */}
        {currentView === 'simulator' && (
          <motion.div key="simulator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Golden Silhouette</p>
              <h1 className="text-4xl font-black">Aesthetic Simulator</h1>
            </header>

            {!simulationResult ? (
              <div className="bento-card border-dashed border-2 border-indigo-500/30 items-center justify-center py-20 bg-indigo-50/50">
                <Scissors className="text-indigo-500 mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">Style Simulation</h3>
                <p className="text-xs text-ios-secondary-label text-center mb-6 max-w-xs">Upload or take a face photo to generate aesthetics.</p>
                
                <div className="flex gap-4 w-full max-w-xs">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleSimulationScan((ev.target?.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                    id="simulator-upload" 
                  />
                  <label htmlFor="simulator-upload" className="flex-1 ios-btn-secondary text-indigo-600 border-indigo-500/30 cursor-pointer flex items-center justify-center gap-2">
                    <Upload size={18} /> Upload
                  </label>

                  <input 
                    type="file" 
                    accept="image/*"
                    capture="user" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleSimulationScan((ev.target?.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                    id="simulator-camera" 
                  />
                  <label htmlFor="simulator-camera" className="flex-1 ios-btn-primary bg-indigo-500 shadow-indigo-500/30 cursor-pointer flex items-center justify-center gap-2">
                    <Camera size={18} /> Camera
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bento-card items-center py-8">
                  <p className="label-cap">Detected Face Shape</p>
                  <p className="text-4xl font-black text-indigo-500">{simulationResult.faceShape}</p>
                </div>
                <div className="bento-grid !p-0">
                  <div className="bento-wide bg-white">
                    <p className="label-cap">Recommended Hairstyles</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {simulationResult.recommendedHairstyles?.map((hair, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{hair}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bento-wide bg-white">
                    <p className="label-cap">Recommended Beards</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {simulationResult.recommendedBeards?.map((beard, i) => (
                        <span key={i} className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{beard}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bento-card bg-indigo-50/50">
                  <p className="label-cap text-indigo-500 mb-2">AI Simulation Logic</p>
                  <p className="text-sm font-bold leading-relaxed">{simulationResult.logic}</p>
                </div>
                <button onClick={() => setSimulationResult(null)} className="w-full ios-btn-secondary">Reset Simulation</button>
              </div>
            )}
          </motion.div>
        )}

        {/* VOCAL RESONANCE VIEW */}
        {currentView === 'voice' && (
          <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto text-center pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Tonal Command</p>
              <h1 className="text-4xl font-black">Vocal Resonance</h1>
              <p className="text-ios-secondary-label text-xs mt-2 font-medium italic">A deep voice is the auditory manifestation of high Aura.</p>
            </header>

            {!vocalResult ? (
              <div className="bento-card border-dashed border-2 border-ios-red/30 items-center justify-center py-20 bg-ios-red/5">
                <div className="w-24 h-24 bg-ios-red/10 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-ios-red/20 animate-ping opacity-20" />
                  <Mic className="text-ios-red" size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">Speak Now</h3>
                <p className="text-xs text-ios-secondary-label mb-8">Record a 5-second clip of your natural speaking voice.</p>
                <div className="flex gap-4 w-full max-w-xs">
                  <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleVocalAnalysis((ev.target?.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                    id="voice-upload" 
                  />
                  <label htmlFor="voice-upload" className="flex-1 ios-btn-secondary text-ios-red border-ios-red/30 cursor-pointer flex items-center justify-center gap-2">
                    <Upload size={18} /> Upload
                  </label>

                  <input 
                    type="file" 
                    accept="audio/*"
                    capture="microphone" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleVocalAnalysis((ev.target?.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                    id="voice-record" 
                  />
                  <label htmlFor="voice-record" className="flex-1 ios-btn-primary bg-ios-red shadow-ios-red/30 cursor-pointer flex items-center justify-center gap-2">
                    <Mic size={18} /> Record
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-left">
                <div className="bento-full bg-white flex flex-row items-center justify-between h-auto py-8">
                   <div>
                     <p className="label-cap">Vocal Aura Boost</p>
                     <p className="text-5xl font-black text-ios-red">+{vocalResult.auraBoost}</p>
                   </div>
                   <div className="text-right">
                     <p className="label-cap">Fundamental Pitch</p>
                     <p className="text-2xl font-black">{vocalResult.pitch} Hz</p>
                   </div>
                </div>
                <div className="bento-grid !p-0">
                  <div className="bento-card">
                    <p className="label-cap">Resonance</p>
                    <p className="font-bold">{vocalResult.resonance}</p>
                  </div>
                  <div className="bento-card">
                    <p className="label-cap">Tonality</p>
                    <p className="font-bold">{vocalResult.tonality}</p>
                  </div>
                </div>
                <div className="bento-card bg-[#1C1C1E] text-white">
                  <p className="label-cap text-ios-red mb-4">Command Exercises</p>
                  <div className="space-y-3">
                    {vocalResult.exercises?.map((ex, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black">{i+1}</span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed">{ex}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setVocalResult(null)} className="w-full ios-btn-secondary">Retake Analysis</button>
              </div>
            )}
          </motion.div>
        )}

        {/* AR GUIDES VIEW */}
        {currentView === 'guides' && (
          <motion.div key="guides" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
            <BackButton />
            <header className="mb-10 text-center pt-8">
              <p className="label-cap">Aesthetic Engineering</p>
              <h1 className="text-4xl font-black">AR Face Yoga</h1>
              <p className="text-ios-secondary-label text-xs mt-2 font-medium">Step-by-step guidance for manual facial refinement.</p>
            </header>

            {!activeGuide ? (
              <div className="space-y-4">
                {[
                  { title: 'Jawline Sculpting', duration: '3 mins', difficulty: 'Beginner', category: 'Exercise' },
                  { title: 'Gua Sha Drainage', duration: '5 mins', difficulty: 'Advanced', category: 'Massage' },
                  { title: 'Eye Symmetry Drift', duration: '2 mins', difficulty: 'Beginner', category: 'Therapy' },
                  { title: 'Temporal Lift', duration: '4 mins', difficulty: 'Intermediate', category: 'Lifting' },
                ].map((guide, idx) => (
                  <div key={idx} className="bento-card flex-row items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-ios-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Camera size={28} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{guide.title}</h4>
                        <p className="text-[10px] font-bold text-ios-secondary-label uppercase tracking-widest">{guide.duration} • {guide.difficulty}</p>
                      </div>
                    </div>
                    <button onClick={() => startFaceYogaGuide(guide)} className="ios-btn-primary py-2 px-4 text-xs">Start</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* 3D Hologram Coach Area */}
                <div className="w-full relative rounded-[32px] overflow-hidden aspect-video border border-ios-blue/20 shadow-2xl shadow-ios-blue/10 bg-black">
                  <FaceCoach guideTitle={activeGuide.title} />
                </div>

                <div className="bento-card w-full text-center">
                  <h3 className="font-black text-2xl mb-2">{activeGuide.title}</h3>
                  <p className="text-sm text-ios-secondary-label font-medium mb-6">
                    {getGuideInstructions(activeGuide.title)}
                  </p>
                  <GuideTimerBlock 
                     durationMinutes={activeGuide.duration} 
                     onComplete={stopFaceYogaGuide} 
                  />
                </div>

                {/* AR Mirror (You!) */}
                <div className="w-full relative rounded-[32px] overflow-hidden bg-black aspect-video shadow-lg border border-white/5">
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="bg-black/60 text-white backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                       Your Mirror
                    </span>
                  </div>
                </div>

                <button onClick={stopFaceYogaGuide} className="ios-btn-secondary w-full py-4 text-ios-red mb-12">End Session</button>
              </div>
            )}
          </motion.div>
        )}
        {currentView === 'leaderboard' && (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="p-4 md:p-8 max-w-2xl mx-auto pb-32"
          >
             <header className="mb-10 px-2 text-center">
                <p className="label-cap">The Elitist 10</p>
                <h1 className="text-4xl font-black tracking-tight">World Ranking</h1>
                <p className="text-ios-secondary-label text-xs mt-2 font-medium">The most aesthetic individuals in the Maximus program.</p>
             </header>

             <div className="space-y-3">
                {leaderboard.map((entry, idx) => (
                  <div 
                    key={entry.userId} 
                    className={`bento-card flex-row items-center gap-4 py-4 ${entry.userId === user.uid ? 'ring-2 ring-ios-blue bg-ios-blue/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-gray-300 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-ios-secondary-label'}`}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200">
                      <img src={entry.avatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${entry.userId}`} alt={entry.displayName} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold truncate text-sm">{entry.displayName}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${getTier(entry.overallScore).color}`}>
                        {getTier(entry.overallScore).name}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-ios-blue">{entry.overallScore}</p>
                       <p className="label-cap !mb-0">Score</p>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* BOTTOM NAVIGATION (UMAX STYLE) */}
      {['dashboard', 'arsenal', 'social', 'routines', 'profile'].includes(currentView) && (
        <nav className="nav-blur grid-cols-5 !px-2">
          {[
            { id: 'dashboard', icon: Scan, label: 'Scanner' },
            { id: 'arsenal', icon: Layers, label: 'Arsenal' },
            { id: 'social', icon: Globe, label: 'Feed' },
            { id: 'routines', icon: CheckSquare, label: 'Routine' },
            { id: 'profile', icon: UserIcon, label: 'Profile' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
              }}
              className={`io-nav-item flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${currentView === item.id ? 'active text-ios-blue bg-ios-blue/10 scale-105' : 'text-ios-secondary-label hover:bg-black/5'} `}
            >
              <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} className="mb-1" />
              <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
