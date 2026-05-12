import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/backend/lib/auth-context';
import { toast } from 'sonner';

interface SchoolInfo {
  name: string;
  location: string;
  poBox: string;
  phone: string;
  email: string;
  tagline: string;
  feesStructure: {
    class: string;
    tuition: number;
    pdl: number;
    test: number;
    total: number;
  }[];
}

const defaultSchoolInfo: SchoolInfo = {
  name: 'Immacurate Driving School',
  location: 'Located At Juja Arcade, 1st Floor',
  poBox: 'P.O Box 717-01001 Kalimoni',
  phone: '0721 171911',
  email: 'immacuratedriving77@gmail.com',
  tagline: 'LEARN WITH THE BEST',
  feesStructure: [
    { class: 'A', tuition: 7500, pdl: 650, test: 1050, total: 9200 },
    { class: 'B', tuition: 12600, pdl: 650, test: 1050, total: 14300 },
    { class: 'C', tuition: 13600, pdl: 650, test: 1050, total: 15300 },
    { class: 'D', tuition: 9000, pdl: 550, test: 1050, total: 10600 },
    { class: 'B HALF', tuition: 8700, pdl: 650, test: 1050, total: 10400 },
    { class: 'C HALF', tuition: 9000, pdl: 550, test: 1050, total: 10600 },
    { class: 'CE', tuition: 35000, pdl: 550, test: 1050, total: 36600 },
  ],
};

export default function About() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(defaultSchoolInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<SchoolInfo>(defaultSchoolInfo);
  
  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('schoolInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSchoolInfo(parsed);
      setEditedInfo(parsed);
    }
  }, []);
  
  const handleSave = () => {
    localStorage.setItem('schoolInfo', JSON.stringify(editedInfo));
    setSchoolInfo(editedInfo);
    setIsEditing(false);
    toast.success('School information updated successfully');
  };
  
  const handleCancel = () => {
    setEditedInfo(schoolInfo);
    setIsEditing(false);
  };
  
  const updateFee = (index: number, field: keyof typeof editedInfo.feesStructure[0], value: string | number) => {
    const newFees = [...editedInfo.feesStructure];
    newFees[index] = { ...newFees[index], [field]: value };
    
    // Recalculate total if numeric fields change
    if (field !== 'class' && field !== 'total') {
      newFees[index].total = newFees[index].tuition + newFees[index].pdl + newFees[index].test;
    }
    
    setEditedInfo({ ...editedInfo, feesStructure: newFees });
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">About Us</h1>
          <p className="text-gray-600 mt-2">School information and fees structure</p>
        </div>
        {isAdmin && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-brand">
            <Edit className="w-4 h-4" />
            Edit Information
          </button>
        )}
        {isAdmin && isEditing && (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn-outline">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button onClick={handleSave} className="btn-brand">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
      
      {/* Logo and School Info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.jpeg" alt="Immacurate Driving School" className="w-full max-w-lg h-auto rounded-lg shadow-lg mb-6" />
            {isEditing ? (
              <input
                type="text"
                value={editedInfo.tagline}
                onChange={(e) => setEditedInfo({ ...editedInfo, tagline: e.target.value })}
                className="form-input text-center text-xl font-bold"
              />
            ) : (
              <p className="text-2xl font-bold text-[#1e293b]">{schoolInfo.tagline}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1e293b] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editedInfo.location}
                        onChange={(e) => setEditedInfo({ ...editedInfo, location: e.target.value })}
                        className="form-input mb-2"
                        placeholder="Location"
                      />
                      <input
                        type="text"
                        value={editedInfo.poBox}
                        onChange={(e) => setEditedInfo({ ...editedInfo, poBox: e.target.value })}
                        className="form-input"
                        placeholder="P.O Box"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-900 font-medium">{schoolInfo.location}</p>
                      <p className="text-gray-600 text-sm">{schoolInfo.poBox}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#1e293b] flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedInfo.phone}
                    onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
                    className="form-input flex-1"
                    placeholder="Phone"
                  />
                ) : (
                  <a href={`tel:${schoolInfo.phone}`} className="text-gray-900 hover:text-[#1e293b]">
                    {schoolInfo.phone}
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1e293b] flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedInfo.email}
                    onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                    className="form-input flex-1"
                    placeholder="Email"
                  />
                ) : (
                  <a href={`mailto:${schoolInfo.email}`} className="text-gray-900 hover:text-[#1e293b]">
                    {schoolInfo.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fees Structure */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 font-display">FEES STRUCTURE</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">CLASS</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">TUITION</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">PDL</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">TEST</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(isEditing ? editedInfo : schoolInfo).feesStructure.map((fee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={fee.class}
                        onChange={(e) => updateFee(index, 'class', e.target.value)}
                        className="form-input w-24"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">{fee.class}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={fee.tuition}
                        onChange={(e) => updateFee(index, 'tuition', parseInt(e.target.value) || 0)}
                        className="form-input w-32"
                      />
                    ) : (
                      <span className="text-gray-900">{fee.tuition.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={fee.pdl}
                        onChange={(e) => updateFee(index, 'pdl', parseInt(e.target.value) || 0)}
                        className="form-input w-32"
                      />
                    ) : (
                      <span className="text-gray-900">{fee.pdl.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={fee.test}
                        onChange={(e) => updateFee(index, 'test', parseInt(e.target.value) || 0)}
                        className="form-input w-32"
                      />
                    ) : (
                      <span className="text-gray-900">{fee.test.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{fee.total.toLocaleString()}/=</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="bg-gradient-to-br from-[#1e293b] to-gray-800 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4 font-display">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Experienced Instructors</h3>
            <p className="text-gray-300 text-sm">Learn from certified professionals with years of experience</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Modern Facilities</h3>
            <p className="text-gray-300 text-sm">State-of-the-art training vehicles and equipment</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Flexible Schedule</h3>
            <p className="text-gray-300 text-sm">Book lessons at times that work for you</p>
          </div>
        </div>
      </div>
    </div>
  );
}
