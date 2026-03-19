export default function BloodTag({ group, className = "" }) {
  return (
    <span className={`blood-tag ${className}`}>
      {group}
    </span>
  );
}
