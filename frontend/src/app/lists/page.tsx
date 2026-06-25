"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bookmark, GripVertical, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";

const myLists = [
  { id: 1, title: "을지로 데이트 코스", description: "분위기 좋은 을지로 맛집 모음", moodTag: "데이트", itemCount: 4, savedCount: 23, seed: "date" },
  { id: 2, title: "혼밥 명당", description: "혼자서도 편하게 먹을 수 있는 곳", moodTag: "혼밥", itemCount: 7, savedCount: 0, seed: "solo" },
  { id: 3, title: "회식 추천", description: "회식하기 좋은 음식점들", moodTag: "회식", itemCount: 5, savedCount: 12, seed: "hoesik" },
];

const selectedListItems = [
  { id: 101, name: "을지로 칼국수", memo: "이 집 칼국수 최고! 면이 쫄깃해요.", order: 1 },
  { id: 102, name: "연남동 스시 오마카세", memo: "데이트할 때 예약 필수인 핫플", order: 2 },
  { id: 103, name: "이태원 양식당", memo: "앤티크한 분위기에 와인 한 잔 하기 좋음", order: 3 },
  { id: 104, name: "망원동 중국집", memo: "바삭한 탕수육과 짬뽕 국물이 일품", order: 4 },
];

const publicLists = [
  { id: 4, title: "홍대 회식 추천", author: "푸디맘", moodTag: "회식", itemCount: 6, savedCount: 45, seed: "hongdae" },
  { id: 5, title: "망원동 카페 투어", author: "카페인 중독", moodTag: "데이트", itemCount: 5, savedCount: 128, seed: "cafe" },
  { id: 6, title: "성수동 브런치", author: "브런치퀸", moodTag: "데이트", itemCount: 4, savedCount: 67, seed: "brunch" },
];

export default function ListsPage() {
  const [selectedId, setSelectedId] = useState(1);
  const selectedList = myLists.find((l) => l.id === selectedId);

  return (
    <AppShell
      rightSidebar={
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
            <p className="text-sm font-bold text-ink mb-3">인기 맛집 리스트</p>
            <div className="space-y-3">
              {publicLists.map((l) => (
                <div key={l.id} className="rounded-xl bg-surface-soft p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">{l.title}</p>
                    <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink">{l.moodTag}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">by {l.author} · 식당 {l.itemCount}개</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">맛집 리스트</h2>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-active transition-colors">
            <Plus className="h-4 w-4" />
            리스트 만들기
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          {/* My lists */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-muted">내 리스트</p>
            {myLists.map((list) => (
              <button
                key={list.id}
                onClick={() => setSelectedId(list.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  selectedId === list.id
                    ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
                    : "border-hairline-soft bg-surface hover:bg-surface-soft"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-bold text-ink">{list.title}</p>
                    <p className="mt-1 text-xs text-muted line-clamp-1">{list.description}</p>
                  </div>
                  <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink shrink-0">{list.moodTag}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-soft">
                  <span>식당 {list.itemCount}개</span>
                  <span>저장 {list.savedCount}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected list detail */}
          <div className="rounded-2xl bg-surface p-5 border border-hairline-soft min-h-[500px]">
            {selectedList ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-hairline-soft pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-ink">{selectedList.title}</h3>
                      <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink">{selectedList.moodTag}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{selectedList.description}</p>
                  </div>
                  <button className="flex items-center gap-1 rounded-lg bg-surface-soft px-3 py-1.5 text-xs font-bold text-muted hover:text-ink transition-colors">
                    <Bookmark className="h-3.5 w-3.5" />
                    저장
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedListItems.map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-xl border border-hairline-soft bg-surface-soft p-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink">{item.name}</p>
                        <p className="mt-1 text-xs text-muted line-clamp-2">{item.memo}</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted">
                        <button className="p-1 hover:text-primary"><GripVertical className="h-3.5 w-3.5" /></button>
                        <button className="p-1 hover:text-primary"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-20 text-center text-sm text-muted">리스트를 선택해주세요</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
