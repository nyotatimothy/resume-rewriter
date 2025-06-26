export type RewriteRequest = {
  resume: string;
  jobDescription: string;
  template: string;
  userEmail?: string;
};

export type RewriteResponse = {
  sections: { [section: string]: string };
  markdown: string;
};

export type Submission = {
  id: string;
  email?: string;
  input: {
    resume: string;
    jobDescription: string;
    template: string;
  };
  output: {
    sections: { [section: string]: string };
    markdown: string;
  };
  createdAt: string;
};
