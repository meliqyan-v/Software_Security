import { useState } from 'react';
import { 
  Usb,
  FileLock2,
  Unlock,
  Search,
  List as ListIcon,
  Trash2,
  FileCode,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import CryptoJS from 'crypto-js';

// --- Types ---

interface SimulatedFile {
  name: string;
  size: string;
  isEncrypted: boolean;
  content: string;
}

interface SimulatedDrive {
  letter: string;
  name: string;
  files: SimulatedFile[];
}

// --- Main App ---

export default function App() {
  const [drives, setDrives] = useState<SimulatedDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<SimulatedDrive | null>(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDrives([
        { 
          letter: "D:\\", 
          name: "SECURE_USB", 
          files: [
            { name: "project_plan.docx", size: "1.2 MB", isEncrypted: false, content: "This is a secret project plan." },
            { name: "private_keys.txt", size: "4 KB", isEncrypted: false, content: "key_12345_abcde" },
            { name: "client_data.csv", size: "850 KB", isEncrypted: false, content: "id,name,email\n1,John Doe,john@example.com" }
          ] 
        },
        { 
          letter: "E:\\", 
          name: "WORK_DRIVE", 
          files: [
            { name: "source_code.zip", size: "15 MB", isEncrypted: false, content: "Binary source code data..." }
          ] 
        }
      ]);
      setIsScanning(false);
    }, 1000);
  };

  const handleProtect = async () => {
    if (!selectedDrive || !encryptionKey) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const updatedDrives = drives.map(d => {
      if (d.letter === selectedDrive.letter) {
        return {
          ...d,
          files: d.files.map(f => {
            if (!f.isEncrypted) {
              const encryptedContent = CryptoJS.AES.encrypt(f.content, encryptionKey).toString();
              return {
                ...f,
                name: f.name + ".aes",
                isEncrypted: true,
                content: encryptedContent
              };
            }
            return f;
          })
        };
      }
      return d;
    });
    
    setDrives(updatedDrives);
    setSelectedDrive(updatedDrives.find(d => d.letter === selectedDrive.letter) || null);
    setIsProcessing(false);
  };

  const handleUnprotect = async () => {
    if (!selectedDrive || !encryptionKey) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    let success = true;
    const updatedDrives = drives.map(d => {
      if (d.letter === selectedDrive.letter) {
        return {
          ...d,
          files: d.files.map(f => {
            if (f.isEncrypted) {
              try {
                const bytes = CryptoJS.AES.decrypt(f.content, encryptionKey);
                const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
                if (!decryptedContent) throw new Error("Invalid key");
                return {
                  ...f,
                  name: f.name.replace(".aes", ""),
                  isEncrypted: false,
                  content: decryptedContent
                };
              } catch (e) {
                success = false;
                return f;
              }
            }
            return f;
          })
        };
      }
      return d;
    });
    
    if (success) {
      setDrives(updatedDrives);
      setSelectedDrive(updatedDrives.find(d => d.letter === selectedDrive.letter) || null);
    } else {
      // In a real app we'd show a toast, here we just don't update if it failed
      console.error("Decryption failed. Check your key.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="border-b-2 border-[#141414] pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif italic font-bold tracking-tight">ProtectUSB Content</h1>
            <p className="text-xs uppercase tracking-[0.2em] opacity-60 mt-2 font-bold">USB Drive Content Copy Protection System</p>
          </div>
          <div className="flex items-center gap-2 bg-[#141414] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
            <ShieldAlert size={14} className="text-yellow-400" />
            System Active
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            <section className="bg-white border border-[#141414] p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center justify-between mb-6 border-b border-[#141414] pb-3">
                <div className="flex items-center gap-2">
                  <Search size={18} />
                  <h2 className="font-serif italic text-sm uppercase font-bold">Drive Detection</h2>
                </div>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="text-[10px] bg-[#141414] text-white px-4 py-1.5 uppercase font-bold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  {isScanning ? 'Scanning...' : 'Scan USB'}
                </button>
              </div>

              <div className="space-y-3">
                {drives.length === 0 ? (
                  <div className="text-center py-8 opacity-30 italic text-xs border border-dashed border-[#141414]/20">
                    No USB drives detected.
                  </div>
                ) : (
                  drives.map((d, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedDrive(d)}
                      className={`w-full flex items-center justify-between p-4 border-2 transition-all ${selectedDrive?.letter === d.letter ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <Usb size={20} />
                        <div className="text-left">
                          <div className="text-xs font-bold uppercase tracking-tight">{d.name}</div>
                          <div className="text-[10px] opacity-60 font-mono">{d.letter} Removable Disk</div>
                        </div>
                      </div>
                      <CheckCircle2 size={16} className={selectedDrive?.letter === d.letter ? 'text-yellow-400' : 'opacity-0'} />
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white border border-[#141414] p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center gap-2 mb-6 border-b border-[#141414] pb-3">
                <FileLock2 size={18} />
                <h2 className="font-serif italic text-sm uppercase font-bold">Security Actions</h2>
              </div>
              
                <div className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase font-bold mb-2 tracking-widest opacity-60">Security Access Key</label>
                  <input 
                    type="password" 
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    placeholder="Enter master key..."
                    className="w-full border-2 border-[#141414] p-3 text-sm focus:outline-none focus:bg-yellow-50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleProtect}
                    disabled={!selectedDrive || !encryptionKey || isProcessing}
                    className="bg-[#141414] text-white p-4 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-30 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileLock2 size={16} /> Protect Content
                  </button>
                  <button 
                    onClick={handleUnprotect}
                    disabled={!selectedDrive || !encryptionKey || isProcessing}
                    className="bg-white border-2 border-[#141414] text-[#141414] p-4 text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 disabled:opacity-30 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Unlock size={16} /> Restore Content
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: File Explorer */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-[#141414] p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-[#141414] pb-3">
                <div className="flex items-center gap-2">
                  <ListIcon size={18} />
                  <h2 className="font-serif italic text-sm uppercase font-bold">
                    File Explorer: <span className="font-mono not-italic text-blue-600">{selectedDrive ? selectedDrive.letter : 'No Drive Selected'}</span>
                  </h2>
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                    Processing Security Layer...
                  </div>
                )}
              </div>

              {!selectedDrive ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <Usb size={80} strokeWidth={0.5} />
                  <p className="text-xs mt-6 uppercase font-bold tracking-[0.3em]">Select a drive to view content</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#141414] font-serif italic opacity-50">
                        <th className="pb-3 font-normal">File Name</th>
                        <th className="pb-3 font-normal">Size</th>
                        <th className="pb-3 font-normal">Security Status</th>
                        <th className="pb-3 font-normal">Type</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {selectedDrive.files.map((f, i) => (
                        <tr key={i} className="border-b border-[#141414]/10 hover:bg-gray-50 transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <FileCode size={18} className={f.isEncrypted ? 'text-red-600' : 'text-blue-600'} />
                            <span className={`text-sm ${f.isEncrypted ? 'font-bold italic text-red-900' : 'font-medium'}`}>
                              {f.name}
                            </span>
                          </td>
                          <td className="py-4 opacity-60">{f.size}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-sm text-[9px] font-bold tracking-widest ${f.isEncrypted ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                              {f.isEncrypted ? 'ENCRYPTED' : 'ORIGINAL'}
                            </span>
                          </td>
                          <td className="py-4 text-[10px] opacity-50 uppercase font-bold">{f.name.split('.').pop()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-auto pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#141414] text-[#E4E3E0] p-5 text-[11px] leading-relaxed border-l-4 border-yellow-400">
                  <div className="flex items-center gap-2 mb-3 text-yellow-400">
                    <Trash2 size={16} />
                    <span className="font-bold uppercase tracking-widest">Integrity Protocol</span>
                  </div>
                  Գաղտնագրման ավարտից հետո համակարգը ավտոմատ կերպով ջնջում է բնօրինակ ֆայլերը (Secure Delete)։ Սա երաշխավորում է, որ կրիչի վրա չեն մնա չպաշտպանված տվյալներ։
                </div>
                <div className="bg-[#141414] text-[#E4E3E0] p-5 text-[11px] leading-relaxed border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <ShieldAlert size={16} />
                    <span className="font-bold uppercase tracking-widest">Encryption Engine</span>
                  </div>
                  Համակարգը կիրառում է բիթային գաղտնագրման ալգորիթմ (Symmetric Cipher)։ Տվյալները վերամշակվում են բարձր արագությամբ՝ ապահովելով տվյալների ակնթարթային պաշտպանություն։
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
