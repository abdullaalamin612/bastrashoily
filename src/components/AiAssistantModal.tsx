import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ShoppingBasket,
  Truck,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Phone,
  Image as ImageIcon,
  Camera,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';

export interface ProductCardItem {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
  category?: string;
  inStock?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isFallback?: boolean;
  image?: string;
  suggestedAction?: {
    label: string;
    action: () => void;
  };
  productCard?: ProductCardItem;
  productCards?: ProductCardItem[];
}

export const AiAssistantModal: React.FC = () => {
  const {
    isAiAssistantOpen,
    closeAiAssistant,
    products,
    navigateToProduct,
    navigateToCategory,
    navigateToTracking,
    openSizeGuideModal,
    generalSettings,
    deliveryConfig,
    showToast,
  } = useShop();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! "বস্ত্র শৈলী (BOSTROSHOILY) - সহকারী" তে আপনাকে স্বাগতম। আপনি বিয়ে বা যেকোনো অনুষ্ঠানের জন্য পাঞ্জাবি, লুঙ্গি, শাড়ি, টি-শার্ট কিংবা আপনার গায়ের রঙ (ফর্সা বা শ্যামলা) অনুযায়ী সেরা পোশাকের পরামর্শ ও সাইজ গাইড জানতে যেকোনো প্রশ্ন করতে পারেন। এমনকি আপনি মুখে ভয়েস দিয়েও কথা বলতে পারেন!',
      timestamp: 'এখন',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceAutoSpeak, setVoiceAutoSpeak] = useState(true);

  // Text to speech for assistant responses
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('আপনার ব্রাউজারে স্পিচ সিন্থেসিস অডিও সাপোর্ট নেই');
      return;
    }
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
    utterance.lang = 'bn-BD';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = async () => {
    setVoiceNotice(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (isListening) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        }
      } catch {}
      setIsListening(false);
      setVoiceNotice('ভয়েস ইনপুট বন্ধ করা হয়েছে।');
      return;
    }

    if (!SpeechRecognition) {
      setVoiceNotice('আপনার ব্রাউজারে সরাসরি স্পিচ রিকগনিশন সাপোর্ট নেই। নিচের যেকোনো ভয়েস প্রশ্নে ক্লিক করুন:');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // Try requesting mic permission first to avoid silent not-allowed errors
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        console.warn('Microphone permission query notice:', micErr);
        if (micErr?.name === 'NotAllowedError' || micErr?.name === 'PermissionDeniedError') {
          setVoiceNotice('মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজারের সাইট সেটিংস থেকে মাইক্রোফোন অনুমতি দিন অথবা নিচের প্রশ্ন বাছাই করুন:');
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalCapturedText = '';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('🎙️ শুনছি... বাংলায় বা ইংরেজিতে কথা বলুন (যেমন: সুতি লুঙ্গির দাম কত?)');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          finalCapturedText = transcript;
          setInputQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceNotice('মাইক্রোফোন পারমিশন এলাউ করা নেই। ব্রাউজারের Lock আইকন থেকে মাইক্রোফোন পারমিশন অন করুন, অথবা নিচের প্রশ্ন বাছাই করুন:');
        } else if (event.error === 'no-speech') {
          setVoiceNotice('কোনো কথা শোনা যায়নি। আবার মাইক্রোফোনে ক্লিক করে বলুন অথবা নিচে প্রশ্ন চাপুন।');
        } else {
          setVoiceNotice('ভয়েস গ্রহণ শেষ হয়েছে। মেসেজ চেক করে পাঠাতে পারেন:');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalCapturedText && finalCapturedText.trim().length > 0) {
          const query = finalCapturedText.trim();
          setVoiceNotice(`🗣️ শোনা গেছে: "${query}"`);
          setTimeout(() => {
            handleSendMessage(query, true);
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      setVoiceNotice('ভয়েস ইনপুট শুরু করা যায়নি। নিচের জনপ্রিয় প্রশ্নসমূহ থেকে সরাসরি বাছাই করুন:');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('অনুগ্রহ করে ছবি ফাইল নির্বাচন করুন');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে');
      return;
    }

    setSelectedImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isAiAssistantOpen) return null;

  const handleSendMessage = async (textToSend?: string, isVoiceMode = false) => {
    const text = (textToSend || inputQuery).trim();
    const imageToSend = selectedImage;
    const mimeToSend = selectedImageMime;

    if (!text && !imageToSend) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text || (imageToSend ? '📷 কাস্টমার পোশাকের ছবি পাঠিয়েছেন' : ''),
      image: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setSelectedImage(null);
    setIsTyping(true);

    const lower = text.toLowerCase();

    // Language Detection: English vs Bangla / Banglish
    const isPureEnglish = /^[a-z0-9\s.,?!'"\-()]+$/i.test(text) &&
      !/(kalo|forsa|biye|onusthan|shyamla|amake|amar|pani|panjabi|lungi|sari|saree|thrice|bhalo|achhe|kemon|ki|kothay|dam|taka|bastra|shoily)/i.test(lower);

    // 1. Instant 1-second responder for name queries
    const isNameQuery = /তোমার নাম|আপনার নাম|নাম কি|নাম কী|নাম বলো|who are you|your name|naam ki|nam ki|amar nam/i.test(lower);
    if (isNameQuery) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: isPureEnglish
              ? 'Hello! I am Tanvir Rahman, the AI Consultant for BOSTROSHOILY. I can help you find the best handloom lungis, premium panjabis, sarees, t-shirts, and three-pieces from our catalog based on your occasion and style preferences!'
              : 'আমার নাম তানভীর রহমান, বস্ত্র শৈলী (BOSTROSHOILY)-এর সহকারী। বস্ত্র শৈলীতে আপনাকে স্বাগতম! আমি সিরাজগঞ্জের খাঁটি তাঁতের লুঙ্গি, প্রিমিয়াম পাঞ্জাবি, শাড়ি, টি-শার্ট ও থ্রি-পিস সহ আপনার পছন্দ ও গায়ের রঙ বা অনুষ্ঠানের জন্য সেরা পোশাক নির্বাচনে সাহায্য করতে পারি।',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
      }, 300);
      return;
    }

    // 2. Instant 1-second responder for Skin tone, Occasion & Category Styling with Catalog Product Cards
    const isDarkSkin = /কালো|শ্যামলা|ডার্ক|dark|black|kalo|shyamla/i.test(lower);
    const isFairSkin = /ফর্সা|উজ্জ্বল|fair|white|forsa/i.test(lower);
    const isOccasion = /বিয়ে|বিয়ে|অনুষ্ঠান|পার্টি|উৎসব|wedding|party|eid|ঈদ|biye|onusthan/i.test(lower);
    const wantsPanjabi = /পাঞ্জাবি|পাঞ্জাবী|panjabi|punjabi/i.test(lower);
    const wantsLungi = /লুঙ্গি|লুঙ্গী|lungi/i.test(lower);
    const wantsSaree = /শাড়ি|শাড়ি|সারী|saree|sari|jamdani/i.test(lower);
    const wantsTshirt = /টি শার্ট|টি-শার্ট|tshirt|t-shirt/i.test(lower);
    const wantsThreePiece = /থ্রি পিস|থ্রি-পিস|থ্রী পিস|three piece|three-piece/i.test(lower);
    const asksSuitability = /মানাবে|পরব|পরা উচিত|পরামর্শ|suggest|সাজেস্ট|manabe|suit|recommend/i.test(lower);

    if (isDarkSkin || isFairSkin || isOccasion || wantsPanjabi || wantsLungi || wantsSaree || wantsTshirt || wantsThreePiece || asksSuitability) {
      let adviceText = '';
      if (isPureEnglish) {
        if (isFairSkin) {
          adviceText = 'For a fair complexion, deep and vibrant shades like Royal Blue, Deep Maroon, Ruby Red, Forest Green, and Navy Blue look striking! For weddings and celebrations, our Royal Semi-Silk Embroidered Panjabi and Dhakai Jamdani Handloom Saree are perfect choices. Here are top products from our website:';
        } else if (isDarkSkin) {
          adviceText = 'For dusky or dark skin tones, soft and contrast shades such as Pure White, Off-White, Soft Cream, Peach, and Golden-Maroon accentuate your elegance. Our Classic Pure White Cotton Panjabi and Handloom Check Lungi will look exceptionally regal on you. Here are top products from our website:';
        } else if (isOccasion) {
          adviceText = 'For weddings and celebratory gatherings, our handcrafted Jamdani Sarees, Pure Silk Sarees, and intricate Embroidered Festive Panjabis are the premier picks. Here are handpicked recommendations from our store:';
        } else {
          adviceText = 'Welcome to BOSTROSHOILY! Here are the finest selections from our catalog crafted with pure cotton handloom and festive heritage:';
        }
      } else {
        if (isFairSkin) {
          adviceText = 'ফর্সা গায়ের রঙের জন্য গাঢ় ও উজ্জ্বল রঙ যেমন রয়্যাল ব্লু, মেরুন, রুবি রেড, ফরেস্ট গ্রিন অথবা নেভি ব্লু পাঞ্জাবি ও শাড়ি অসাধারণ মানাবে। বিশেষ করে বিয়ে বা কোনো অনুষ্ঠানে আপনি আমাদের এক্সক্লুসিভ রয়্যাল সেমি সিল্ক এম্ব্রয়ডারি পাঞ্জাবি অথবা ঐতিহ্যবাহী ঢাকাই জামদানি তাঁতের শাড়ি বেছে নিতে পারেন! ওয়েবসাইট থেকে সরাসরি পছন্দের প্রোডাক্টটি দেখুন:';
        } else if (isDarkSkin) {
          adviceText = 'শ্যামলা বা কালো গায়ের রঙের জন্য সফট ও উজ্জ্বল কন্ট্রাস্ট কালার যেমন ক্লাসিক পিউর হোয়াইট, অফ-হোয়াইট, সফট ক্রিম, পিচ, উজ্জ্বল গোল্ডেন অথবা গোল্ডেন-মেরুন কম্বিনেশনের পাঞ্জাবি এবং ঐতিহ্যবাহী সিরাজগঞ্জ চেক তাঁতের লুঙ্গি অত্যন্ত আভিজাত্যপূর্ণ ও আকর্ষণীয় দেখাবে। ওয়েবসাইট থেকে সরাসরি সেরা প্রোডাক্টগুলো নিচে দেওয়া হলো:';
        } else if (isOccasion) {
          adviceText = 'বিয়ে বা কোনো উৎসবের মতো বিশেষ অনুষ্ঠানের জন্য আমাদের প্রিমিয়াম ঢাকাই জামদানি শাড়ি, খাঁটি সিল্ক শাড়ি এবং রয়্যাল এম্ব্রয়ডারি উৎসব পাঞ্জাবি সবচেয়ে সেরা মানানসই পছন্দ। নিচের তালিকা থেকে সরাসরি অর্ডার করতে পারেন:';
        } else if (wantsLungi) {
          adviceText = 'বস্ত্র শৈলী (BOSTROSHOILY)-এর সিরাজগঞ্জ ও শাহজাদপুরের ৮০ কাউন্ট সুতার খাঁটি তাঁতের লুঙ্গি অত্যন্ত আরামদায়ক ও টেকসই। দৈনন্দিন ব্যবহার ও উৎসবের জন্য নিচে আমাদের সেরা লুঙ্গি কালেকশন তুলে ধরা হলো:';
        } else if (wantsPanjabi) {
          adviceText = 'উৎসব ও আভিজাত্যের জন্য আমাদের রয়্যাল সেমি সিল্ক ও পিউর সুতি এম্ব্রয়ডারি পাঞ্জাবি সেরা পছন্দ। আপনার জন্য মানানসই পাঞ্জাবি নিচে দেওয়া হলো:';
        } else if (wantsSaree) {
          adviceText = 'ঐতিহ্যবাহী তাঁতের ঢাকাই জামদানি ও এক্সক্লুসিভ রাজশাহী পিউর সিল্ক শাড়ির সেরা কালেকশন নিচে দেওয়া হলো:';
        } else if (wantsThreePiece) {
          adviceText = 'হ্যান্ডলুম কটন ডিজাইনার এম্ব্রয়ডারি থ্রি-পিস যেকোনো ঘরোয়া ও আনুষ্ঠানিক অনুষ্ঠানে আপনাকে দেবে চমৎকার আরাম ও পরিপাটি লুক। সেরা থ্রি-পিস নিচে দেওয়া হলো:';
        } else {
          adviceText = 'বস্ত্র শৈলী (BOSTROSHOILY)-এর ১০০% খাঁটি সুতি তাঁতের লুঙ্গি, ঐতিহ্যবাহী উৎসব পাঞ্জাবি ও ঢাকাই জামদানি শাড়ির মধ্য থেকে আপনার জন্য সেরা পণ্যগুলো নিচে দেওয়া হলো:';
        }
      }

      // Filter website products matching criteria
      let targetProducts = products.filter((p) => {
        const pNorm = `${p.name} ${p.banglaName || ''} ${p.subCategory || ''} ${p.category || ''}`.toLowerCase();
        if (wantsPanjabi) return pNorm.includes('panjabi') || pNorm.includes('পাঞ্জাবি');
        if (wantsLungi) return pNorm.includes('lungi') || pNorm.includes('লুঙ্গি');
        if (wantsSaree) return pNorm.includes('saree') || pNorm.includes('শাড়ি') || pNorm.includes('শাড়ি') || pNorm.includes('jamdani');
        if (wantsTshirt) return pNorm.includes('t-shirt') || pNorm.includes('tshirt') || pNorm.includes('টি-শার্ট');
        if (wantsThreePiece) return pNorm.includes('three-piece') || pNorm.includes('থ্রি-পিস') || pNorm.includes('থ্রী পিস');
        if (isOccasion) return pNorm.includes('panjabi') || pNorm.includes('saree') || pNorm.includes('three-piece');
        if (isFairSkin) return pNorm.includes('panjabi') || pNorm.includes('saree');
        if (isDarkSkin) return pNorm.includes('panjabi') || pNorm.includes('lungi');
        return true;
      });

      if (targetProducts.length === 0) {
        targetProducts = products;
      }

      const suggestedCards: ProductCardItem[] = targetProducts.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.banglaName || p.name,
        price: p.discountPrice || p.price,
        originalPrice: p.discountPrice ? p.price : undefined,
        image: p.mainImage,
        slug: p.slug || p.id,
        category: p.subCategory || p.category,
        inStock: (p.stock || 0) > 0,
      }));

      setTimeout(() => {
        const aiMsgId = `ai-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: adviceText,
            productCards: suggestedCards,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
        if (isVoiceMode || voiceAutoSpeak) {
          speakText(adviceText, aiMsgId);
        }
      }, 350);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Call server-side conversational AI endpoint (powered by aiEngine & aiTools)
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          imageBase64: imageToSend,
          mimeType: mimeToSend,
          history: messages.slice(-10).map((m) => ({
            sender: m.sender,
            text: m.text,
            productCards: m.productCards,
          })),
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const aiMsgId = `ai-${Date.now()}`;
          const aiMsg: ChatMessage = {
            id: aiMsgId,
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            productCards: data.productCards && data.productCards.length > 0 ? data.productCards : undefined,
          };

          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
          if (isVoiceMode || voiceAutoSpeak) {
            speakText(data.reply, aiMsgId);
          }
          return;
        }
      }
    } catch {
      // Fast graceful response
    }

    // Fast conversational fallback
    const isEnglish = /^[a-zA-Z0-9\s.,?!'-]+$/.test(text) && !/kemon|ache|dekhi|apni|tumi|amake|bastra|bostro/i.test(lower);
    const fallbackText = isEnglish
      ? 'Welcome to BOSTROSHOILY! We offer authentic handloom lungis, premium panjabis, jamdani sarees, and designer three-pieces. For instant assistance, feel free to call our helpline (+880 1864-528488) or explore our catalog.'
      : 'বস্ত্র শৈলী (BOSTROSHOILY)-তে আপনাকে স্বাগতম! আমাদের সিরাজগঞ্জের খাঁটি তাঁতের লুঙ্গি, প্রিমিয়াম পাঞ্জাবি, শাড়ি ও টি-শার্টের কালেকশন দেখতে পারেন। যেকোনো প্রয়োজনে আমাদের হেল্পলাইনে (+880 1864-528488) সরাসরি কল করতে পারেন।';
    const fallbackMsgId = `ai-${Date.now()}`;
    const fallbackMsg: ChatMessage = {
      id: fallbackMsgId,
      sender: 'ai',
      text: fallbackText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, fallbackMsg]);
    setIsTyping(false);
    if (isVoiceMode || voiceAutoSpeak) {
      speakText(fallbackText, fallbackMsgId);
    }
  };

  const openWhatsAppDirect = () => {
    const phone = generalSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '8801864528488';
    const text = encodeURIComponent('আসসালামু আলাইকুম, বস্ত্র শৈলী (BOSTROSHOILY) থেকে একটি বিষয়ে সরাসরি তথ্য জানতে যোগাযোগ করছি।');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div
      id="ai-assistant-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="ai-assistant-modal-box"
        className="relative w-full max-w-lg h-[620px] max-h-[92vh] bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-100">বস্ত্র শৈলী (BOSTROSHOILY) - সহকারী</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                  সহকারী
                </span>
              </div>
              <p className="text-[11px] text-stone-400">পণ্য, সাইজ ও ডেলিভারির রিয়েল-টাইম তথ্য</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !voiceAutoSpeak;
                setVoiceAutoSpeak(next);
                if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                showToast(next ? 'স্বয়ংক্রিয় ভয়েস উত্তর সক্রিয়' : 'ভয়েস উত্তর বন্ধ');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                voiceAutoSpeak
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700'
              }`}
              title="এআই সহকারী মুখে উত্তর বলবে"
            >
              <Volume2 className={`w-3.5 h-3.5 ${voiceAutoSpeak ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} />
              <span>{voiceAutoSpeak ? 'ভয়েস আউটপুট: অন' : 'ভয়েস: অফ'}</span>
            </button>
            <button
              onClick={closeAiAssistant}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar shrink-0">
          <span className="text-stone-400 shrink-0 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            দ্রুত প্রশ্ন:
          </span>
          {[
            'পাঞ্জাবির সাইজ কত?',
            'লুঙ্গির মাপ ও বহর কেমন?',
            'ডেলিভারি চার্জ ও সময় কত?',
            'ক্যাশ অন ডেলিভারি আছে?',
            '৭ দিনের রিটার্ন পলিসি কি?',
            'পাঞ্জাবি কালেকশন ও দাম',
            'অর্ডার ট্র্যাক করব কিভাবে?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="bg-white hover:bg-stone-200 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
                }`}
              >
                {/* User Uploaded Image in Chat */}
                {msg.image && (
                  <div className="mb-2">
                    <img
                      src={msg.image}
                      alt="Customer attached"
                      onClick={() => setPreviewModalImage(msg.image!)}
                      className="max-w-[220px] max-h-[180px] rounded-xl object-cover border-2 border-white/60 cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}

                <div className="leading-relaxed">{msg.text}</div>

                {msg.sender === 'ai' && (
                  <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, msg.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-amber-700 bg-stone-50 hover:bg-amber-50 px-2 py-0.5 rounded-md cursor-pointer transition-colors border border-stone-200/60"
                      title={speakingMessageId === msg.id ? 'ভয়েস থামান' : 'মুখে শুনে শুনুন'}
                    >
                      <Volume2 className={`w-3 h-3 ${speakingMessageId === msg.id ? 'text-amber-600 animate-pulse' : ''}`} />
                      <span>{speakingMessageId === msg.id ? 'থামান' : 'ভয়েসে শুনুন'}</span>
                    </button>
                    <span className="text-[9px] text-stone-400">{msg.timestamp}</span>
                  </div>
                )}

                {/* Multiple Product Cards with Images if AI returned products */}
                {msg.productCards && msg.productCards.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        বস্ত্র শৈলী (BOSTROSHOILY) কালেকশন পণ্য ({msg.productCards.length}টি)
                      </span>
                      <span className="text-[10px] text-stone-500 font-normal">ছবিতে ক্লিক করে বড় দেখুন</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.productCards.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 flex flex-col justify-between gap-2 shadow-2xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="relative w-14 h-14 rounded-lg overflow-hidden bg-white border border-stone-200 shrink-0 cursor-pointer"
                              onClick={() => setPreviewModalImage(p.image)}
                              title="বড় করে ছবি দেখুন"
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-tl">ছবি</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-stone-900 text-xs line-clamp-1">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-black text-amber-700 text-xs">৳{p.price}</span>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <span className="text-[10px] text-stone-400 line-through">৳{p.originalPrice}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              closeAiAssistant();
                              navigateToProduct(p.slug);
                            }}
                            className="w-full py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>বিস্তারিত ও কিনুন</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single Product Card Attachment Fallback */}
                {msg.productCard && (!msg.productCards || msg.productCards.length === 0) && (
                  <div
                    onClick={() => {
                      closeAiAssistant();
                      navigateToProduct(msg.productCard!.slug);
                    }}
                    className="mt-3 p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={msg.productCard.image}
                      alt={msg.productCard.name}
                      className="w-12 h-14 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-xs truncate">
                        {msg.productCard.name}
                      </p>
                      <p className="font-bold text-amber-700 text-xs mt-0.5">
                        ৳{msg.productCard.price}
                      </p>
                      <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                        বিস্তারিত দেখুন <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Direct Action Button */}
                {msg.suggestedAction && (
                  <button
                    onClick={msg.suggestedAction.action}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-stone-100 hover:bg-black rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {/* Fallback WhatsApp Button (Requirement: Fallback to WhatsApp for unknown topics) */}
                {msg.isFallback && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <button
                      onClick={openWhatsAppDirect}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                      <span>সরাসরি WhatsApp-এ কথা বলুন ({generalSettings.phone || '+880 1864-528488'})</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-stone-400 px-1 mt-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-stone-500 text-xs bg-white border border-stone-200 w-fit px-3 py-2 rounded-2xl rounded-bl-none shadow-2xs">
              <Bot className="w-4 h-4 text-amber-500 animate-spin" />
              <span>বস্ত্র শৈলী (BOSTROSHOILY) AI ভাবছে...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Image Upload & Send */}
        <div className="p-3 bg-white border-t border-stone-200 shrink-0">
          {/* Voice input live status / permission notice & voice prompt chips */}
          {(voiceNotice || isListening) && (
            <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-amber-600'}`} />
                  <span className="font-bold text-[11px] leading-tight">
                    {isListening ? 'শুনছি... আপনার প্রশ্নটি মুখে বলুন 🎙️ (যেমন: পাঞ্জাবি কালেকশন)' : voiceNotice}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVoiceNotice(null);
                    if (isListening) {
                      try { recognitionRef.current?.stop(); } catch {}
                      setIsListening(false);
                    }
                  }}
                  className="text-stone-400 hover:text-stone-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'পাঞ্জাবি কালেকশন দেখান',
                  'তাঁতের সুতি লুঙ্গি',
                  'জামদানি শাড়ির দাম কত?',
                  'টি-শার্ট সাইজ চার্ট',
                  'ডেলিভারি চার্জ কত?',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    onClick={() => {
                      setInputQuery(promptText);
                      handleSendMessage(promptText);
                      setVoiceNotice(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 text-[10px] font-semibold text-stone-800 border border-amber-200 cursor-pointer transition shadow-2xs"
                  >
                    🗣️ &ldquo;{promptText}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Image Preview with Remove Button */}
          {selectedImage && (
            <div className="relative inline-flex items-center gap-2 mb-2 p-1.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 animate-in fade-in">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-12 h-12 rounded-lg object-cover border border-amber-300"
              />
              <div className="pr-6">
                <p className="font-bold text-[11px]">ছবি সংযুক্ত হয়েছে</p>
                <p className="text-[10px] text-stone-500">মেসেজ লিখে বা সরাসরি পাঠান</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1.5 right-1.5 p-1 bg-stone-200 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                title="ছবি বাতিল করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden file input for image upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Photo Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-stone-200 transition-colors cursor-pointer shrink-0"
              title="পোশাক বা পণ্যের ছবি পাঠান"
            >
              <ImageIcon className="w-4.5 h-4.5" />
            </button>

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
                  : 'text-stone-600 hover:text-amber-700 hover:bg-amber-50 border-stone-200'
              }`}
              title={isListening ? 'ভয়েস ইনপুট চলছে... বন্ধ করতে ক্লিক করুন' : 'মুখে কথা বলুন (ভয়েস ইনপুট)'}
            >
              {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={selectedImage ? 'এই ছবিটি সম্পর্কে কিছু বলতে চান? (ঐচ্ছিক)...' : 'যেকোনো পোশাক, সাইজ, ডেলিভারি বা ছবি দেখতে লিখুন...'}
              className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() && !selectedImage}
              className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
              title="পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Modal for Zooming / Enlarged Photo Preview */}
        {previewModalImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setPreviewModalImage(null)}
          >
            <div
              className="relative max-w-lg max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewModalImage}
                alt="Enlarged view"
                className="max-w-full max-h-[75vh] object-contain rounded-xl mx-auto"
              />
              <button
                onClick={() => setPreviewModalImage(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full cursor-pointer transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
