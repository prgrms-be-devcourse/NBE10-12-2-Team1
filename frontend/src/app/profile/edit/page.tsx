"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Eye, EyeOff } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function EditProfilePage() {
  const router = useRouter();

  // mock 로그인 방식: "kakao" | "email"
  const [loginType] = useState<"kakao" | "email">("email");

  const [nickname, setNickname] = useState("오늘의푸디");
  const [email, setEmail] = useState("foodie@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState("https://picsum.photos/seed/myprofile/120/120");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "email" && newPassword && newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    alert("프로필이 수정되었습니다. (API 연동 예정)");
    router.push("/profile");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-bold text-ink">내 정보 수정</h2>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-6 border border-hairline-soft shadow-sm space-y-6">
          {/* Profile image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={previewImage}
                alt="프로필 미리보기"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/15"
              />
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-active transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="mt-3 text-xs text-muted">프로필 사진 변경</p>
          </div>

          {/* Nickname */}
          <div>
            <label className="text-xs font-bold text-muted mb-1.5 block">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-hidden"
              required
            />
          </div>

          {/* Email login only */}
          {loginType === "email" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-hidden"
                  required
                />
              </div>

              <div className="border-t border-hairline-soft pt-6 space-y-4">
                <p className="text-sm font-bold text-ink">비밀번호 변경</p>

                <div>
                  <label className="text-xs font-bold text-muted mb-1.5 block">현재 비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="현재 비밀번호 입력"
                      className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 pr-10 text-sm text-ink focus:border-primary focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted mb-1.5 block">새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호"
                    className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted mb-1.5 block">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {/* Kakao login notice */}
          {loginType === "kakao" && (
            <div className="rounded-xl bg-surface-soft p-4 text-sm text-muted">
              카카오 로그인 계정은 닉네임과 프로필 사진만 변경할 수 있습니다.
              <br />
              이메일/비밀번호 변경은 카카오 계정 관리에서 해주세요.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/profile"
              className="flex-1 rounded-xl border border-hairline bg-surface-soft py-2.5 text-center text-sm font-bold text-ink hover:bg-white transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
