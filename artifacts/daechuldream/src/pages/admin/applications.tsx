import { useState } from "react";
import {
  useGetAdminApplications,
  useDeleteApplication,
  getGetAdminApplicationsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Application = {
  id: number;
  name: string;
  phone: string;
  job_type: string;
  loan_amount?: string | null;
  loan_purpose?: string | null;
  residence_type?: string | null;
  annual_income?: string | null;
  credit_score?: string | null;
  message?: string | null;
  status: string;
  created_at: string;
};

function parseMessage(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-900 font-medium break-all">{value}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">
        {title}
      </h4>
      {children}
    </div>
  );
}

function ApplicationDetail({ app, open, onClose, onDelete }: {
  app: Application | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  if (!app) return null;
  const extra = parseMessage(app.message);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>신청 상세 — {app.name}</span>
            <span className="text-xs text-gray-400 font-normal">
              {new Date(app.created_at).toLocaleString("ko-KR")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-1">
          <DetailSection title="개인정보">
            <DetailRow label="성함" value={app.name} />
            <DetailRow label="연락처" value={app.phone} />
            <DetailRow label="성별" value={extra["성별"]} />
            <DetailRow label="연령대" value={extra["연령대"]} />
            <DetailRow label="거주지역" value={app.residence_type} />
          </DetailSection>

          <DetailSection title="사업자 기본 정보">
            <DetailRow label="사업자 유형" value={app.job_type} />
            <DetailRow label="사업 기간" value={extra["사업기간"]} />
            <DetailRow label="업종" value={extra["업종"]} />
            <DetailRow label="업태" value={extra["업태"]} />
          </DetailSection>

          <DetailSection title="매출 정보">
            <DetailRow label="2024년 신고 매출액" value={extra["2024년매출"]} />
            <DetailRow label="2025년 신고 매출액" value={app.annual_income} />
            <DetailRow label="월평균 매출" value={extra["월평균매출"]} />
          </DetailSection>

          <DetailSection title="기존 대출">
            <DetailRow label="대출 건수" value={extra["기존대출건수"]} />
            <DetailRow label="대출 총잔액" value={extra["기존대출총잔액"]} />
            <DetailRow label="대출 종류" value={extra["대출종류"]} />
          </DetailSection>

          <DetailSection title="연체 여부">
            <DetailRow label="현재 연체 중" value={extra["현재연체"]} />
            <DetailRow label="최근 1년 내 연체" value={extra["1년이내연체"]} />
          </DetailSection>

          <DetailSection title="희망 조건">
            <DetailRow label="희망 대출 금액" value={app.loan_amount} />
            <DetailRow
              label="자금 사용 용도"
              value={[app.loan_purpose, extra["자금용도기타"]].filter(Boolean).join(" / ")}
            />
          </DetailSection>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => { onDelete(app.id); onClose(); }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            신청 삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminApplications() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [jobType, setJobType] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  const queryParams = {
    page,
    limit: 10,
    ...(jobType !== "all" ? { job_type: jobType } : {}),
  };

  const { data, isLoading, error } = useGetAdminApplications(queryParams, {
    query: {
      enabled: !!token,
      queryKey: getGetAdminApplicationsQueryKey(queryParams),
    },
    request: {
      headers: { "x-admin-token": token || "" },
    },
  });

  const deleteMutation = useDeleteApplication({
    request: {
      headers: { "x-admin-token": token || "" },
    },
    mutation: {
      onSuccess: () => {
        toast({ title: "삭제 완료", description: "신청 내역이 삭제되었습니다." });
        queryClient.invalidateQueries({ queryKey: getGetAdminApplicationsQueryKey(queryParams) });
        setDeleteId(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "삭제 실패", description: "삭제에 실패했습니다." });
        setDeleteId(null);
      },
    },
  });

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate({ id: deleteId });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          데이터를 불러오는데 실패했습니다. 권한을 확인해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">신청 내역</h1>
          <p className="text-muted-foreground">모든 상담 신청 내역을 조회하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={jobType} onValueChange={(val) => { setJobType(val); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="사업자 유형 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="개인사업자">개인사업자</SelectItem>
              <SelectItem value="법인사업자">법인사업자</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            조회 결과
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (총 {data?.total || 0}건)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>신청일시</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>사업자 유형</TableHead>
                  <TableHead>거주지역</TableHead>
                  <TableHead>희망 금액</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(7).fill(0).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.applications && data.applications.length > 0 ? (
                  data.applications.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setDetailApp(app as Application)}
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="font-semibold">{app.name}</TableCell>
                      <TableCell>{app.phone}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                          {app.job_type || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{app.residence_type || "-"}</TableCell>
                      <TableCell className="font-medium text-primary">{app.loan_amount || "-"}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setDetailApp(app as Application)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteId(app.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      신청 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.total > 10 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <div className="text-sm font-medium">
                {page} / {Math.ceil(data.total / 10)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / 10)}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <ApplicationDetail
        app={detailApp}
        open={!!detailApp}
        onClose={() => setDetailApp(null)}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 신청 내역이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
