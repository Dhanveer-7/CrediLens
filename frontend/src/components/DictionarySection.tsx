import React, { useState } from "react";
import { BookOpen, Search, HelpCircle } from "lucide-react";
import { UI_LOCALIZATION, type Language } from "../locale";

interface Term {
  term: string;
  definition: string;
}

interface DictionarySectionProps {
  language: Language;
  extractedDictionary: Term[];
}

export const DictionarySection: React.FC<DictionarySectionProps> = ({
  language,
  extractedDictionary,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const text = UI_LOCALIZATION[language];

  // A comprehensive default glossary to ensure this section is fully loaded and valuable
  // even before any document is uploaded!
  const defaultGlossary: { [key in Language]: Term[] } = {
    en: [
      { term: "APR (Annual Percentage Rate)", definition: "The total yearly cost of borrowing a loan, including the interest rate plus processing fees and other charges expressed as a percentage." },
      { term: "EMI (Equated Monthly Installment)", definition: "The fixed amount of money you pay back to the bank every month until the loan is fully repaid." },
      { term: "Collateral", definition: "An asset or property (like a house, gold, or land) that a borrower offers to the lender as security for the loan. If the borrower defaults, the bank can seize it." },
      { term: "Foreclosure / Pre-Closure", definition: "Paying off the remaining loan amount completely before the official completion date. Banks often charge a foreclosure fee for this." },
      { term: "Amortization", definition: "The process of spreading out a loan into a series of equal periodic payments. Each payment is split between the principal amount and interest." },
      { term: "Principal", definition: "The actual amount of money you borrow from the bank before interest starts accumulating." },
      { term: "Late Payment Penalty", definition: "An extra fee charged by the lender if you fail to pay your EMI by the agreed due date." },
      { term: "Processing Fee", definition: "A one-time fee charged by the bank to cover the administrative cost of evaluating and approving your loan application." },
      { term: "Floating Interest Rate", definition: "An interest rate that fluctuates over time based on market conditions, meaning your EMI amount can increase or decrease." },
      { term: "Fixed Interest Rate", definition: "An interest rate that remains constant throughout the entire tenure of the loan, keeping your EMI payments exactly the same." }
    ],
    hi: [
      { term: "एपीआर (APR - वार्षिक प्रतिशत दर)", definition: "ऋण लेने की कुल वार्षिक लागत, जिसमें ब्याज दर के साथ प्रसंस्करण शुल्क और अन्य खर्चों को प्रतिशत के रूप में शामिल किया जाता है।" },
      { term: "ईएमआई (EMI - समान मासिक किस्त)", definition: "वह निश्चित राशि जो आप ऋण पूरी तरह से चुकाए जाने तक हर महीने बैंक को भुगतान करते हैं।" },
      { term: "जमानत (Collateral / कोलैटरल)", definition: "कोई संपत्ति (जैसे घर, सोना या जमीन) जिसे ऋण लेने वाला सुरक्षा के रूप में बैंक को देता है। भुगतान न करने पर बैंक इसे जब्त कर सकता है।" },
      { term: "फोरक्लोज़र / समय-पूर्व बंदी (Foreclosure)", definition: "तय समय से पहले लोन की पूरी शेष राशि का भुगतान करके लोन बंद करना। बैंक इसके लिए शुल्क ले सकते हैं।" },
      { term: "ऋणमुक्ति (Amortization)", definition: "ऋण को समान किस्तों में बांटने की प्रक्रिया। प्रत्येक किस्त में मूलधन और ब्याज दोनों शामिल होते हैं।" },
      { term: "मूलधन (Principal)", definition: "वह वास्तविक राशि जो आप बैंक से उधार लेते हैं, जिस पर ब्याज की गणना की जाती है।" },
      { term: "विलंब शुल्क (Late Payment Penalty)", definition: "यदि आप तय तिथि तक ईएमआई का भुगतान नहीं करते हैं, तो बैंक द्वारा लगाया जाने वाला अतिरिक्त जुर्माना।" },
      { term: "प्रसंस्करण शुल्क (Processing Fee)", definition: "लोन आवेदन के मूल्यांकन और अनुमोदन की प्रशासनिक लागत को पूरा करने के लिए बैंक द्वारा लिया जाने वाला एकमुश्त शुल्क।" },
      { term: "अस्थिर ब्याज दर (Floating Interest Rate)", definition: "वह ब्याज दर जो बाजार की स्थितियों के आधार पर बदलती रहती है, जिससे आपकी ईएमआई बढ़ या घट सकती है।" },
      { term: "निश्चित ब्याज दर (Fixed Interest Rate)", definition: "वह ब्याज दर जो पूरे लोन की अवधि के दौरान समान रहती है, जिससे आपकी ईएमआई का भुगतान बिल्कुल नहीं बदलता।" }
    ],
    ta: [
      { term: "ஏபிஆர் (APR - ஆண்டு சதவீத விகிதம்)", definition: "வட்டி விகிதம், செயலாக்கக் கட்டணம் மற்றும் இதர செலவுகள் உட்பட நீங்கள் ஒரு கடனைப் பெறுவதற்கான ஒட்டுமொத்த ஆண்டுச் செலவு சதவீதம்." },
      { term: "இஎம்ஐ (EMI - சமமான மாதாந்திர தவணை)", definition: "கடன் முழுமையாக அடைக்கப்படும் வரை ஒவ்வொரு மாதமும் நீங்கள் வங்கிக்கு செலுத்த வேண்டிய நிலையான தொகை." },
      { term: "பிணையம் (Collateral / கொலேட்ரல்)", definition: "கடனுக்கான பாதுகாப்பாக வங்கியிடம் ஒப்படைக்கும் சொத்து (வீடு, தங்கம், நிலம் போன்றவை). நீங்கள் கடனைத் திருப்பிச் செலுத்தத் தவறினால் வங்கி இதை எடுத்துக் கொள்ளலாம்." },
      { term: "முன்கூட்டியே அடைத்தல் (Foreclosure)", definition: "கடன் முடிவடையும் காலத்திற்கு முன்பே மீதமுள்ள கடன் தொகை முழுவதையும் செலுத்தி கடனை முடிப்பது. இதற்கு வங்கிகள் கட்டணம் விதிக்கலாம்." },
      { term: "கடன்தவணைக் கணக்கீடு (Amortization)", definition: "கடனை சமமான தவணைகளாகப் பிரிக்கும் முறை. ஒவ்வொரு தவணையிலும் அசல் தொகையும் வட்டியும் பிரிக்கப்பட்டிருக்கும்." },
      { term: "அசல் (Principal)", definition: "வட்டி கணக்கிடப்படுவதற்கு முன்பு நீங்கள் வங்கியிடமிருந்து வாங்கிய உண்மையான கடன் தொகை." },
      { term: "தாமதக் கட்டண அபராதம் (Late Payment Penalty)", definition: "குறிப்பிட்ட தேதிக்குள் தவணை செலுத்தத் தவறினால் விதிக்கப்படும் கூடுதல் அபராதக் கட்டணம்." },
      { term: "செயலாக்கக் கட்டணம் (Processing Fee)", definition: "கடன் விண்ணப்பத்தை சரிபார்த்து அங்கீகரிக்க வங்கி வசூலிக்கும் ஒருமுறை கட்டணம்." },
      { term: "மாறும் வட்டி விகிதம் (Floating Interest Rate)", definition: "சந்தை நிலவரத்திற்கு ஏற்ப மாறும் வட்டி விகிதம், இதனால் உங்கள் மாதாந்திர தவணை அதிகரிக்கலாம் அல்லது குறையலாம்." },
      { term: "நிலையான வட்டி விகிதம் (Fixed Interest Rate)", definition: "கடன் காலம் முழுவதும் மாறாமல் இருக்கும் வட்டி விகிதம், இதனால் உங்கள் மாதாந்திர தவணை மாறாது." }
    ],
    te: [
      { term: "ఏపీఆర్ (APR - వార్షిక శాతం రేటు)", definition: "వడ్డీ రేటు,ప్రాసెసింగ్ ఫీజులు మరియు ఇతర ఖర్చులతో కలిపి రుణం యొక్క మొత్తం వార్షిక ఖర్చు శాతం." },
      { term: "ఈఎంఐ (EMI - సమాన నెలవారీ వాయిదా)", definition: "రుణం పూర్తిగా చెల్లించే వరకు ప్రతి నెల బ్యాంకుకు చెల్లించాల్సిన స్థిరమైన వాయిదా మొత్తం." },
      { term: "పూచీకత్తు (Collateral / కొలేటరల్)", definition: "రుణం కోసం భద్రతగా బ్యాంకుకు ఇచ్చే ఆస్తి (ఇల్లు, బంగారం లేదా భూమి). రుణం చెల్లించకపోతే బ్యాంకు దీనిని స్వాధీనం చేసుకుంటుంది." },
      { term: "ఫోర్‌క్లోజర్ / ముందస్తు ముగింపు", definition: "నిర్ణీత గడువు కంటే ముందే మిగిలిన రుణ మొత్తాన్ని పూర్తిగా చెల్లించి అప్పును ముగించడం." },
      { term: "అమోర్టైజేషన్ (Amortization)", definition: "రుణాన్ని సమాన వాయిదాలుగా విభజించే ప్రక్రియ. ప్రతి వాయిదాలో అసలు మరియు వడ్డీ భాగాలు ఉంటాయి." },
      { term: "అసలు (Principal)", definition: "వడ్డీ లేకుండా మీరు బ్యాంకు నుండి తీసుకున్న అసలు అప్పు మొత్తం." },
      { term: "ఆలస్య రుసుము (Late Payment Penalty)", definition: "గడువు తేదీ లోపల ఈఎంఐ చెల్లించనందుకు బ్యాంకు విధించే జరిమానా ఫీజు." },
      { term: "ప్రాసెసింగ్ ఫీజు (Processing Fee)", definition: "రుణ దరఖాస్తును పరిశీలించడానికి బ్యాంకు వసూలు చేసే ఏకకాల రుసుము." },
      { term: "మారుతున్న వడ్డీ రేటు (Floating Interest Rate)", definition: "మార్కెట్ పరిస్థితులను బట్టి మారే వడ్డీ రేటు, దీనివల్ల మీ ఈఎంఐ పెరగవచ్చు లేదా తగ్గొచ్చు." },
      { term: "స్థిర వడ్డీ రేటు (Fixed Interest Rate)", definition: "రుణ కాల పరిమితి మొత్తం ఒకేలా ఉండే వడ్డీ రేటు, దీనివల్ల మీ ఈఎంఐ మారదు." }
    ],
    kn: [
      { term: "ಎಪಿಆರ್ (APR - ವಾರ್ಷಿಕ ಶೇಕಡಾವಾರು ದರ)", definition: "ಸಾಲದ ಒಟ್ಟು ವಾರ್ಷಿಕ ವೆಚ್ಚ, ಬಡ್ಡಿ ದರ, ಸಂಸ್ಕರಣಾ ಶುಲ್ಕ ಮತ್ತು ಇತರೆ ವೆಚ್ಚಗಳನ್ನು ಶೇಕಡಾವಾರು ರೂಪದಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತದೆ." },
      { term: "ಇಎಂಐ (EMI - ಸಮಾನ ಮಾಸಿಕ ಕಂತು)", definition: "ಸಾಲವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಮರುಪಾವತಿಸುವವರೆಗೆ ಪ್ರತಿ ತಿಂಗಳು ಬ್ಯಾಂಕಿಗೆ ಪಾವತಿಸಬೇಕಾದ ಸ್ಥಿರ ಮೊತ್ತ." },
      { term: "ಗಿರವಿ / ಭದ್ರತೆ (Collateral / ಕೊಲ್ಯಾಟರಲ್)", definition: "ಸಾಲಕ್ಕೆ ಭದ್ರತೆಯಾಗಿ ಬ್ಯಾಂಕಿಗೆ ನೀಡುವ ಆಸ್ತಿ (ಮನೆ, ಚಿನ್ನ ಅಥವಾ ಜಮೀನು). ಸಾಲ ಮರುಪಾವತಿ ಮಾಡದಿದ್ದರೆ ಬ್ಯಾಂಕ್ ಇದನ್ನು ಜಪ್ತಿ ಮಾಡಬಹುದು." },
      { term: "ಫೋರ್‌ಕ್ಲೋಸರ್ / ಅವಧಿಪೂರ್ವ ಮುಕ್ತಾಯ", definition: "ನಿಗದಿತ ಅವಧಿಗಿಂತ ಮುಂಚಿತವಾಗಿ ಸಾಲದ ಸಂಪೂರ್ಣ ಮೊತ್ತವನ್ನು ಮರುಪಾವತಿಸಿ ಸಾಲವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸುವುದು." },
      { term: "ಸಾಲ ಮರುಪಾವತಿ ಪ್ರಕ್ರಿಯೆ (Amortization)", definition: "ಸಾಲವನ್ನು ಸಮಾನ ಕಂತುಗಳಾಗಿ ವಿಂಗಡಿಸುವ ವಿಧಾನ. ಪ್ರತಿ ಕಂತಿನಲ್ಲಿ ಅಸಲು ಮತ್ತು ಬಡ್ಡಿ ಇರುತ್ತದೆ." },
      { term: "ಅಸಲು (Principal)", definition: "ಬಡ್ಡಿ ಇಲ್ಲದಂತೆ ನೀವು ಬ್ಯಾಂಕಿನಿಂದ ಪಡೆದ ಸಾಲದ ಮೂಲ ಮೊತ್ತ." },
      { term: "ವಿಳಂಬ ಶುಲ್ಕ (Late Payment Penalty)", definition: "ನಿಗದಿತ ದಿನಾಂಕದೊಳಗೆ ಇಎಂಐ ಪಾವತಿಸದಿದ್ದಲ್ಲಿ ಬ್ಯಾಂಕ್ ವಿಧಿಸುವ ಹೆಚ್ಚುವರಿ ದಂಡ ಶುಲ್ಕ." },
      { term: "ಸಂಸ್ಕರಣಾ ಶುಲ್ಕ (Processing Fee)", definition: "ಸಾಲದ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಬ್ಯಾಂಕ್ ವಿಧಿಸುವ ಏಕಕಾಲದ ಶುಲ್ಕ." },
      { term: "ಬದಲಾಗುವ ಬಡ್ಡಿ ದರ (Floating Interest Rate)", definition: "ಮಾರುಕಟ್ಟೆಯ ಆಧಾರದ ಮೇಲೆ ಬದಲಾಗುವ ಬಡ್ಡಿ ದರ, ಇದರಿಂದ ನಿಮ್ಮ ಇಎಂಐ ಹೆಚ್ಚಾಗಬಹುದು ಅಥವಾ ಕಡಿಮೆಯಾಗಬಹುದು." },
      { term: "ಸ್ಥಿರ ಬಡ್ಡಿ ದರ (Fixed Interest Rate)", definition: "ಸಾಲದ ಅವಧಿಯ ಉದ್ದಕ್ಕೂ ಒಂದೇ ಸಮನಾಗಿ ಇರುವ ಬಡ್ಡಿ ದರ, ಇದರಿಂದ ನಿಮ್ಮ ಇಎಂಐ ಬದಲಾಗುವುದಿಲ್ಲ." }
    ],
    ml: [
      { term: "എപിആർ (APR - വാർഷിക ശതമാന നിരക്ക്)", definition: "പലിശ നിരക്കും പ്രോസസ്സിംഗ് ഫീസും മറ്റ് ചാർജുകളും ഉൾപ്പെടെ വായ്പ എടുക്കുന്നതിനുള്ള മൊത്തം വാർഷിക ചിലവ് ശതമാനത്തിൽ." },
      { term: "ഇഎംഐ (EMI - വായ്പ ഗഡു)", definition: "വായ്പ പൂർണ്ണമായി അടച്ചു തീരുന്നതുവരെ എല്ലാ മാസവും ബാങ്കിലേക്ക് അടയ്ക്കേണ്ട നിശ്ചിത തുക." },
      { term: "കൊളാറ്ററൽ / ഈട് (Collateral)", definition: "വായ്പക്ക് സുരക്ഷിതത്വമായി ബാങ്കിൽ നൽകുന്ന വീട്, സ്വർണ്ണം, ഭൂമി മുതലായവ. വായ്പ തിരിച്ചടച്ചില്ലെങ്കിൽ ബാങ്കിന് ഇത് കണ്ടുകെട്ടാം." },
      { term: "ഫോർക്ലോഷർ / കാലാവധിക്ക് മുൻപ് വായ്പ തീർക്കൽ", definition: "ഔദ്യോഗിക കാലാവധി തീരുന്നതിന് മുൻപ് വായ്പ തുക മുഴുവനായി അടച്ചുതീർക്കുക. ബാങ്കുകൾ ഇതിനായി പ്രത്യേക ഫീസ് ഈടാക്കാം." },
      { term: "അമോർട്ടൈസേഷൻ (Amortization)", definition: "വായ്പ തുക നിശ്ചിത തവണകളായി തുല്യ ഗഡുക്കളായി തിരിച്ചടയ്ക്കുന്ന പ്രക്രിയ. ഇതിൽ അസലും പലിശയും അടങ്ങിയിരിക്കും." },
      { term: "അസൽ (Principal)", definition: "പലിശ കൂട്ടാതെ ബാങ്കിൽ നിന്നും നിങ്ങൾ വായ്പയായി വാങ്ങിയ യഥാർത്ഥ തുക." },
      { term: "വൈകി അടയ്ക്കുന്നതിനുള്ള പിഴ (Late Payment Penalty)", definition: "നിശ്ചിത തീയതിക്കുള്ളിൽ ഇഎംഐ അടച്ചില്ലെങ്കിൽ ബാങ്ക് ഈടാക്കുന്ന അധിക പിഴ തുക." },
      { term: "പ്രോസസ്സിംഗ് ഫീസ് (Processing Fee)", definition: "ലോൺ അപേക്ഷ പരിശോധിക്കുന്നതിനായി ബാങ്ക് ഈടാക്കുന്ന ഒറ്റത്തവണ ഫീസ്." },
      { term: "മാറിക്കൊണ്ടിരിക്കുന്ന പലിശ നിരക്ക് (Floating Interest Rate)", definition: "വിപണി സാഹചര്യം അനുസരിച്ച് മാറുന്ന പലിശ നിരക്ക്, ഇതിലൂടെ നിങ്ങളുടെ ഇഎംഐ തുക കൂടുകയോ കുറയുകയോ ചെയ്യാം." },
      { term: "സ്ഥിരമായ പലിശ നിരക്ക് (Fixed Interest Rate)", definition: "ലോൺ കാലാവധി തീരുന്നതുവരെ ഒരേ നിരക്കിൽ തുടരുന്ന പലിശ നിരക്ക്, ഇതിൽ ഇഎംഐ വ്യത്യാസപ്പെടില്ല." }
    ]
  };

  // Combine default glossary with terms extracted dynamically from the loan document analysis
  const combinedGlossary = [
    ...(defaultGlossary[language] || defaultGlossary.en),
    ...(extractedDictionary || []).map(item => ({
      term: item.term,
      definition: item.definition
    }))
  ];

  // Remove duplicates based on lowercased term name
  const uniqueGlossary: Term[] = [];
  const seenTerms = new Set<string>();
  
  combinedGlossary.forEach(item => {
    const key = item.term.toLowerCase();
    if (!seenTerms.has(key)) {
      seenTerms.add(key);
      uniqueGlossary.push(item);
    }
  });

  // Filter glossary based on query
  const filteredGlossary = uniqueGlossary.filter(
    item =>
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animated-fade">
      {/* Title Panel */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <BookOpen size={24} color="var(--primary)" />
          {text.dictTitle}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
          {text.dictDesc}
        </p>

        {/* Search Bar */}
        <div style={{
          marginTop: "20px",
          position: "relative",
          display: "flex",
          alignItems: "center"
        }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "16px" }} />
          <input
            type="text"
            placeholder={text.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ width: "100%", paddingLeft: "48px", marginBottom: "0" }}
          />
        </div>
      </div>

      {/* Dictionary List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }} className="dictionary-grid-layout">
        <style>{`
          @media (min-width: 768px) {
            .dictionary-grid-layout {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
        
        {filteredGlossary.length === 0 ? (
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center", gridColumn: "1 / -1", color: "var(--text-secondary)" }}>
            <HelpCircle size={32} style={{ margin: "0 auto 12px auto", color: "var(--text-muted)" }} />
            <p style={{ fontWeight: "600" }}>{text.noTermsFound}</p>
          </div>
        ) : (
          filteredGlossary.map((item, index) => (
            <div
              key={index}
              className="glass-panel glass-panel-hover"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                borderLeft: "4px solid var(--primary)"
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                {item.term}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {item.definition}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
