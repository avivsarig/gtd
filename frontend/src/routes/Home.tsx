import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Home() {
  return (
    <div className="flex h-[666px] flex-col items-center gap-3 bg-red-500">
      <span className="text-3xl">this red area is Home.tsx component</span>
      <a href="https://ui.shadcn.com/" className="text-3xl underline">
        the button below is from shudcn library{" "}
      </a>
      <Dialog>
        <DialogTrigger className="bg-primary cursor-pointer rounded-md p-4 text-white">
          Click me
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
