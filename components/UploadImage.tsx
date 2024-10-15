"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface UploadImageProps {
  handleSubmit: () => void;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  isLoading: boolean;
}

const UploadImage = ({
  handleSubmit,
  setFile,
  isLoading,
}: UploadImageProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      const File = event.target.files?.[0];
      if (File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(File);
      } else {
        setPreview(null);
      }
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image">Select an image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        <div className="aspect-video rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
          {preview ? (
            <Image
              height={0}
              width={0}
              sizes="100vw"
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <ImageIcon size={32} />
              <span>No image selected</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full lg:w-fit bg-purple-500 hover:bg-purple-600 focus:outline-none"
          size={"sm"}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className=" h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Convert
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UploadImage;
