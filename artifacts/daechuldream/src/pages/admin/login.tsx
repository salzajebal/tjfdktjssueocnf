import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export function AdminLogin() {
  const { login } = useAuth();
  const { toast } = useToast();
  const adminLogin = useAdminLogin();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    adminLogin.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          if (data.success && data.token) {
            login(data.token);
            toast({
              title: "로그인 성공",
              description: "관리자 대시보드로 이동합니다.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "로그인 실패",
              description: "비밀번호를 확인해주세요.",
            });
          }
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "로그인 실패",
            description: "서버 오류가 발생했습니다. 다시 시도해주세요.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">관리자 로그인</CardTitle>
          <CardDescription>프라임브릿지 관리자 시스템에 접속합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={adminLogin.isPending}
              >
                {adminLogin.isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
