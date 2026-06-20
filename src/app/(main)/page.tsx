import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PlantCard } from "@/components/PlantCard";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/i18n";

import { auth, requireHousehold } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // requireHousehold is safe here: session is guaranteed above.
  // It will lazy-create a household if one doesn't exist yet.
  const householdId = await requireHousehold();
  const plants = await prisma.plant.findMany({
    where: { householdId },
    orderBy: { createdAt: "desc" }
  });
  const t = await getDictionary();

  const healthyCount = plants.filter(p => p.status === 'healthy').length;
  const attentionCount = plants.length - healthyCount;

  const thrivingText = t.dashboard.plantsThriving
    .replace('{count}', healthyCount.toString())
    .replace('{plantWord}', healthyCount === 1 ? t.dashboard.plantsThrivingSingle : t.dashboard.plantsThrivingPlural);

  const attentionText = attentionCount > 0 
    ? t.dashboard.plantsAttention
        .replace('{count}', attentionCount.toString())
        .replace('{attentionWord}', attentionCount === 1 ? t.dashboard.plantsAttentionSingle : t.dashboard.plantsAttentionPlural)
    : '';

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-on-surface">{t.dashboard.title}</h1>
          <p className="text-on-surface-variant mt-1">
            {thrivingText}{attentionText}
          </p>
        </div>
      </header>

      {/* Hero Action Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/identify" className="bg-primary-container text-on-primary-container rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10 w-2/3">
            <div className="w-12 h-12 bg-on-primary-container/10 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="add_a_photo" className="text-2xl" />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">{t.dashboard.addNewPlant}</h2>
            <p className="text-sm">{t.dashboard.addNewPlantDesc}</p>
          </div>
          <Icon name="potted_plant" className="absolute -bottom-4 -right-4 !text-9xl opacity-10 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </Link>

        <Link href="/playbook" className="bg-secondary-container text-on-secondary-container rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10 w-2/3">
            <div className="w-12 h-12 bg-on-secondary-container/10 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="calendar_month" className="text-2xl" />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">{t.dashboard.weeklyPlaybook}</h2>
            <p className="text-sm">{t.dashboard.weeklyPlaybookDesc}</p>
          </div>
          <Icon name="auto_awesome" className="absolute -bottom-4 -right-4 !text-9xl opacity-10 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-on-surface">{t.dashboard.inventory}</h2>
        </div>
        
        {plants.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-surface-container border-dashed">
            <Icon name="potted_plant" className="text-6xl text-surface-container-highest mb-4" />
            <h3 className="text-lg font-medium text-on-surface mb-2">{t.dashboard.noPlantsTitle}</h3>
            <p className="text-on-surface-variant mb-6">{t.dashboard.noPlantsDesc}</p>
            <Link href="/identify" className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold inline-block">
              {t.dashboard.addFirstPlant}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {plants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
