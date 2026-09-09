import type { SiteContent } from "@/lib/types";

/**
 * THE SEED
 * --------
 * Aayush's CV, turned entirely into DATA. Nothing here is hand-placed on the
 * page — the map, previews, gallery and chatbot all draw from these records via
 * the one rendering machine. Later, Supabase becomes the source and this seed
 * (a) bootstraps a fresh database and (b) is the fallback when no keys are set,
 * so the site is always alive.
 *
 * Links/URLs the CV only showed as "Link" are left empty on purpose — they
 * collapse cleanly in the UI, and are the first things to paste in from /studio.
 */
export const SEED: SiteContent = {
  profile: {
    name: "Aayush Adhikari",
    tagline:
      "Applied-AI researcher & developer — mapping machine learning onto real-world problems.",
    shortBio:
      "B.Tech in Computer Science (COMPEX Scholar, Indian Embassy) with a research footing in applied AI across cybersecurity, bioinformatics, NLP and computer vision. I build hybrid and ensemble models that bridge machine learning with real problems — and write up what I find. Currently shipping web work while seeking interdisciplinary research collaborations.",
    location: "Kathmandu, Nepal",
    email: "ayushadhikari3466@gmail.com",
    cvFileUrl: "", // served from Supabase storage once uploaded in /studio
    avatar: "",
    socials: [
      { platform: "Email", url: "mailto:ayushadhikari3466@gmail.com", icon: "mail" },
      { platform: "LinkedIn", url: "", icon: "linkedin" },
      { platform: "GitHub", url: "", icon: "github" },
      { platform: "Google Scholar", url: "", icon: "scholar" },
    ],
    skills: [
      { group: "Programming", items: ["Python", "JavaScript"] },
      {
        group: "Machine Learning & AI",
        items: [
          "TensorFlow",
          "Keras",
          "Scikit-Learn",
          "XGBoost",
          "Ensemble Methods",
        ],
      },
      {
        group: "Data Science & Optimization",
        items: [
          "Pandas",
          "NumPy",
          "Matplotlib",
          "Particle Swarm Optimization (PSO)",
          "Data Preprocessing",
        ],
      },
      { group: "Frameworks & Development", items: ["Django", "React"] },
      {
        group: "Research & Analysis",
        items: ["ML Model Development", "Research Writing", "Data Visualization"],
      },
    ],
  },

  education: [
    {
      id: "edu-btech",
      degree: "B.Tech — Computer Science Engineering",
      institution: "C.V. Raman Global University",
      location: "Odisha, India",
      dates: "Oct 2021 – May 2025",
      detail: "CGPA 8.93 / 10.0 · Funded by the COMPEX Scholarship (Indian Embassy)",
      order: 1,
    },
    {
      id: "edu-class12",
      degree: "Higher Secondary (Class 12)",
      institution: "Southwestern School",
      location: "Kathmandu, Nepal",
      dates: "",
      detail: "GPA 3.71 / 4.0 · Awarded a +2 study scholarship",
      order: 2,
    },
  ],

  publications: [
    {
      id: "pub-ddos-svmdt",
      title:
        "Enhancing DDoS Attack Detection: A Hybrid SVM–Decision Tree Ensemble Approach",
      venue: "IEEE ICCCNT 2024 (15th Int'l Conf. on Computing, Communication & Networking Technologies), IIT Mandi",
      status: "published",
      date: "2024",
      region: "cybersecurity",
      abstract:
        "A hybrid machine-learning model combining Support Vector Machines and Decision Trees to detect DDoS attacks, achieving very high accuracy on the CICDDoS2019 dataset and strengthening network security.",
      links: [],
      resultImages: [],
      order: 1,
    },
    {
      id: "pub-ddos-alddos",
      title:
        "Predicting DDoS Attacks: A Machine Learning Approach using the ALDDoS Dataset",
      venue: "IEEE ICCCNT 2024 (15th Int'l Conf. on Computing, Communication & Networking Technologies), IIT Mandi",
      status: "published",
      date: "2024",
      region: "cybersecurity",
      abstract:
        "Random Forest and XGBoost models predict DDoS attacks with very high accuracy on the ALDDoS dataset, paired with a custom web-proxy policy to reinforce cyber defence.",
      links: [],
      resultImages: [],
      order: 2,
    },
    {
      id: "pub-reddit-mentalhealth",
      title:
        "Beyond Single-Window Classification: A Temporally Validated Framework for Differentiating Adjacent Mental-Health Communities on Reddit",
      venue: "Information Processing & Management (Elsevier)",
      status: "under-review",
      date: "2025",
      authors: ["Aayush Adhikari", "Bikesh Sedhain"],
      region: "nlp",
      abstract:
        "A large-scale adjacent-community Reddit depression-classification framework (265,472 users, AUC = 0.8779) with strict temporal-holdout validation — showing general-purpose embeddings outperform domain-pretrained MentalBERT, and that LIME statistically dominates SHAP on probability-space faithfulness metrics.",
      links: [],
      resultImages: [],
      order: 1,
    },
    {
      id: "pub-pso-microarray",
      title:
        "A Two-Stage Ensemble Feature Selection with Particle Swarm Optimization for Microarray Data Classification in Distributed Computing Environments",
      venue: "AI Open (submitted) · arXiv preprint",
      status: "under-review",
      date: "2025",
      authors: [
        "Aayush Adhikari",
        "Sandesh Bhatta",
        "Harendra Singh",
        "Amit Mishra",
        "Khair Ul Nisa",
        "Abu Taha Zamani",
        "Aaron Sapkota",
        "Debendra Muduli",
        "Nikhat Parveen",
      ],
      region: "bioinformatics",
      abstract:
        "An ensemble feature-selection method leveraging Particle Swarm Optimization for microarray data classification, improving performance in distributed computing environments by selecting optimal gene subsets.",
      links: [],
      resultImages: [],
      order: 1,
    },
    {
      id: "pub-quantum-requirements",
      title:
        "A Quantum-Enhanced Ensemble Learning Approach for Accurate Classification of Functional and Non-Functional Requirements in Software Engineering",
      venue: "Manuscript completed",
      status: "manuscript",
      date: "2025",
      authors: [
        "Sandesh Bhatta",
        "Aaron Sapkota",
        "Aayush Adhikari",
        "Debendra Muduli",
        "Jyoti Bhushan Dahal",
      ],
      region: "nlp",
      abstract:
        "A quantum-enhanced ensemble-learning framework for software-requirements classification, reaching 95.05% accuracy by integrating variational quantum circuits with classical machine learning and transformer models.",
      links: [],
      resultImages: [],
      order: 2,
    },
  ],

  projects: [
    {
      id: "proj-currency-cnn",
      title:
        "Nepali Currency Denomination Detection with Optimized CNNs",
      type: "research-project",
      region: "vision",
      date: "2024",
      summary:
        "Real-time classification and counterfeit detection of Nepali currency using an optimized MobileNetV2.",
      description:
        "A deep-learning system built on MobileNetV2 for real-time classification and counterfeit detection of Nepali currency denominations — tuned for efficiency so it runs on modest hardware.",
      tech: ["TensorFlow", "Keras", "MobileNetV2", "Computer Vision"],
      liveUrl: "",
      repoUrl: "",
      previewImage: "",
      previewSource: null,
      order: 1,
    },
    {
      id: "proj-lung-cnn",
      title: "Lung-Disease Classification with Hyperparameter Tuning",
      type: "research-project",
      region: "vision",
      date: "2023",
      summary:
        "A CNN classifying chest X-rays into COVID-19, Normal and Pneumonia.",
      description:
        "A Convolutional Neural Network classifying chest X-ray images into COVID-19, Normal and Pneumonia categories, using data augmentation, normalization and Keras-Tuner hyperparameter optimization to lift both performance and architecture quality.",
      tech: ["Keras", "TensorFlow", "Keras Tuner", "CNN"],
      liveUrl: "",
      repoUrl: "",
      previewImage: "",
      previewSource: null,
      order: 2,
    },
    {
      id: "proj-mental-chatbot",
      title: "Mental-Health Chatbot — Emotion Detection & Guidance",
      type: "app",
      region: "nlp",
      date: "2024",
      summary:
        "A 24/7 therapeutic-support chatbot with voice input, emotion classification and crisis detection.",
      description:
        "An AI mental-health chatbot combining Whisper ASR for voice, a fine-tuned DistilRoBERTa emotion classifier, and a RAG framework for crisis detection and 24/7 therapeutic support.",
      tech: ["Whisper ASR", "DistilRoBERTa", "RAG", "NLP", "Python"],
      liveUrl: "",
      repoUrl: "",
      previewImage: "",
      previewSource: null,
      order: 3,
    },
    {
      id: "proj-no-hunger-zone",
      title: "No Hunger Zone",
      type: "website",
      region: "development",
      date: "2024",
      summary:
        "A surplus-food redistribution platform — 3rd place at a hackathon. (SDG · ongoing)",
      description:
        "A PHP-based platform that redistributes surplus food by tracking it across locations, built toward the Sustainable Development Goals. Took 3rd place at a prominent hackathon and is still in active development.",
      tech: ["PHP", "MySQL", "Web"],
      liveUrl: "",
      repoUrl: "",
      previewImage: "",
      previewSource: null,
      order: 1,
    },
  ],

  experience: [
    {
      id: "exp-tailoring-ideas",
      role: "Web Developer",
      org: "Tailoring Ideas",
      startDate: "Mar 2026",
      endDate: "",
      ongoing: true,
      summary: "Web development.",
      order: 1,
    },
    {
      id: "exp-research-cvrgu",
      role: "Research Assistant",
      org: "C.V. Raman Global University",
      startDate: "Feb 2024",
      endDate: "2025",
      ongoing: false,
      summary:
        "Under Dr. Debendra Muduli: explored cybersecurity with a focus on DDoS detection/prediction via machine learning — designing hybrid models and a custom web-proxy policy — and investigated Particle-Swarm-Optimization feature selection for bioinformatics microarray data in distributed systems.",
      links: [],
      order: 2,
    },
    {
      id: "exp-volunteer-scout",
      role: "Volunteer Instructor (Community Engagement)",
      org: "Nepal Scout & Youth Vision Crew",
      startDate: "Jun 2024",
      endDate: "",
      ongoing: false,
      summary: "Delivered technical workshops on ML fundamentals to youth participants.",
      links: [],
      order: 3,
    },
    {
      id: "exp-codeclause",
      role: "Data Science Intern",
      org: "Code Clause",
      startDate: "Jun 2023",
      endDate: "Jul 2023",
      ongoing: false,
      summary:
        "Hands-on projects in data analysis, machine learning and statistical modelling under experienced mentors.",
      order: 4,
    },
  ],

  gallery: [],

  chatbotFacts: [
    {
      id: "fact-compex",
      fact: "Aayush holds the COMPEX Scholarship from the Indian Embassy (awarded by EDCIL, Government of India) — a fully funded B.Tech (2021–2025) with a monthly stipend.",
    },
    {
      id: "fact-ibm",
      fact: "IBM Machine Learning certificates: Exploratory Data Analysis for ML; Supervised ML — Regression; Supervised ML — Classification; and CNNs with TensorFlow.",
    },
    {
      id: "fact-plus2",
      fact: "He was also awarded a scholarship for his +2 (higher secondary) studies.",
    },
    {
      id: "fact-hackathon",
      fact: "His No Hunger Zone project won 3rd place at a prominent hackathon.",
    },
    {
      id: "fact-interests",
      fact: "Research interests — core methods: applied machine learning, computational optimization, ensemble methods and hybrid model development; application domains: network intrusion detection, cybersecurity, bioinformatics and computer vision.",
    },
    {
      id: "fact-supervisor",
      fact: "His research at C.V. Raman Global University was supervised by Dr. Debendra Muduli.",
    },
    {
      id: "fact-seeking",
      fact: "Aayush is an aspiring research candidate seeking opportunities to contribute to impactful, interdisciplinary research, expand his theoretical foundation and collaborate across fields.",
    },
  ],
};
