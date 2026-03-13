// Types from src/components/ui/toast.tsx

import * as React from "react";
import { Toast, ToastAction } from "@/components/ui/toast";

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export type ToastActionElement = React.ReactElement<typeof ToastAction>;