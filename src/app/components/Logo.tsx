import Image from 'next/image';

export default function Logo() {
  return (
    <div className="px-4">
      <Image
        src="/assets/teacherflow-logo.png"
        alt="TeacherFlow Logo"
        width={225}
        height={60}
        priority
      />
    </div>
  );
}
