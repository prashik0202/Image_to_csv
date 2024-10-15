"use client";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { Button } from "@/components/ui/button";
import UploadImage from "@/components/UploadImage";
import axios from "axios";
import { Download } from "lucide-react";
import React, { useState } from "react";

const page = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [content, setContent] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/google", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      if (response.status === 200) {
        const responsedata = await response.data;
        console.log(responsedata);
        setContent(responsedata);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //Export to csv config
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    title: "Download",
  });

  //handle csv export:
  const handleExportCSV = (data: any[]) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 md:p-16 items-center">
      {/* Upload image Component */}
      <UploadImage
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        setFile={setFile}
      />
      {/* Download Button */}
      <div className="flex flex-col justify-start gap-3">
        <p className="text-gray-500">
          Upload the Image of hardcopy of tabular data and convert into csv file
        </p>
        <Button
          className="flex justify-center gap-3 items-center w-fit"
          onClick={() => {
            const data = content;
            handleExportCSV(data);
          }}
          disabled={isLoading || content.length === 0}
        >
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    </div>
  );
};

export default page;
