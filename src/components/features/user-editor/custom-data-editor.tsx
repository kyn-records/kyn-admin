import { useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import axiosInstance from "@/service/axios";
import { toast } from "sonner";


let socialMedia = [
  { platform: 'Instagram' ,icon:  <FaInstagram className="w-5 h-5" />},
  { platform: 'Twitter' ,icon:  <FaTwitter className="w-5 h-5" />},
  { platform: 'Facebook' ,icon:  <FaFacebook className="w-5 h-5" />},
  { platform: 'YouTube',icon:  <FaYoutube className="w-5 h-5" />},
  { platform: 'TikTok' ,icon: <FaTiktok className="w-5 h-5" />}
]

const CustomDataEditor = ({ user }: { user: User }) => {
  const [customData, setCustomData] = useState(
    user.customData || {}
  );
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(formValues: any) {
    setSubmitting(true);
    console.log(formValues);
    let promise;
    let serialized = customData;
    
    try {
      promise = axiosInstance.put("/user/admin-api/custom-data", {
        target: user._id,
        customData: serialized,
      });
      toast.promise(promise, {
        loading: "Processing changes...",
        success: "Update complete",
        error: (data: any) => {
          console.log(data);
          const errors = data?.response?.data?.additionalInfo?.errors;
          if (errors) {
            return "Invalid JSON";
          }
          return "Update failed!";
        },
      });
      await promise;
    } finally {
      setSubmitting(false);
    }
  }

  const updateSocialMedia = (key: string, value: string) => {
    let customDataCopy = { ...customData };
  
    if (!customDataCopy.socialMedia) {
      customDataCopy.socialMedia = [];
    }
  
    const platformIndex = customDataCopy.socialMedia.findIndex(a => a.platform === key);
  
    if (platformIndex === -1) {
      customDataCopy.socialMedia.push({ platform: key, url: value });
    } else {
      customDataCopy.socialMedia[platformIndex].url = value;
    }
  
    setCustomData(customDataCopy);
  };
  
  
  return (
    <>
      <Input
        value={customData.website}
        onChange ={(code) => setCustomData((a) => {
          const aCopy = {...a}
          aCopy.website = code.target.value
          return aCopy
        })}
        placeholder="Website"
        className="text-sm mb-4 rounded-lg [&>*]:rounded-lg border overflow-hidden"
      />
      { 
      socialMedia.map((data) =>{
        const IconComponent = [data.icon];
        return (
          <div key={data.platform} className="relative mb-4">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {IconComponent ||  null}
            </div>

            <Input
            value={customData.socialMedia?.find(a => a.platform == data.platform)?.url || ''}
            onChange ={(code) => updateSocialMedia(data.platform,code.target.value)}
              placeholder={data.platform}
              className="pl-10 text-sm rounded-lg border overflow-hidden"
            />
          </div>
        );
      })
      }
      <div className="flex sm:flex-row sm:justify-center sm:space-x-2 flex-col mt-4">
        <Button
          type="submit"
          className="mb-2 md:mb-0"
          variant="outline"
          onClick={onSubmit}
        >
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "Saving..." : "Save Data"}
        </Button>
      </div>
    </>
  );
};

export default CustomDataEditor;
